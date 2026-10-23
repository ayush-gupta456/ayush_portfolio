import { isSafeReference, resourcePostIssue } from '../../shared/note-rules.js';
import { buttondownConfigured, makeNewsletterEvent, deliverNewsletter } from './buttondown.js';
import express from 'express';
import { detectMedia, uploadMedia } from './media.js';
import { z } from 'zod';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
const digest = value => createHash('sha256').update(value).digest('hex');
const email = z.string().trim().toLowerCase().email().max(254);
const attachment = z.object({name:z.string().max(200),url:z.string().url().max(2000).refine(isSafeReference),type:z.enum(['pdf','image','link','file'])});
const post = z.object({ title:z.string().trim().min(5).max(160), category:z.enum(['Engineering','Web','Data','Cloud','Tech','Posts']), author:z.string().trim().min(2).max(80), summary:z.string().trim().min(20).max(400), body:z.string().trim().min(20).max(30000), attachments:z.array(attachment).max(8).default([]), topic:z.string().trim().max(100).default(''),resourceType:z.enum(['video','channel','repository','app','other']).default('other'),resourceUrl:z.string().trim().max(2000).default(''),coverUrl:z.string().trim().max(2000).refine(v=>!v||isSafeReference(v)).default('') });
export const validateResourcePost = resourcePostIssue;
export function registerNotes(app,{col,adminGuard,mutateGuard,requireOrigin,publicOrigin,persistentRateLimit,newsletter}) {
 const usesButtondown=()=>process.env.NEWSLETTER_PROVIDER==='buttondown';
 const configured=newsletter?.configured || (()=>Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim()));
 const subscriptionLimit=persistentRateLimit({name:'subscription-ip',limit:5,windowMs:3600000,message:'Too many subscription requests. Please try again in an hour.'});
 app.get('/api/public/subscription/status',(_req,res)=>res.json({available:configured()}));
 const limit = persistentRateLimit({name:'notes-write',limit:5,windowMs:3600000,message:'You have reached the submission limit. Please try again in an hour.'});
 const wrap = fn => async(req,res,next)=>{try{await fn(req,res);}catch(e){next(e);}};
 const uploadLimit=persistentRateLimit({name:'notes-upload',limit:15,windowMs:3600000,message:'You have reached the attachment upload limit. Please try again in an hour.'});
 app.post('/api/public/notes/upload',requireOrigin(publicOrigin),uploadLimit,express.raw({type:'application/octet-stream',limit:'10mb'}),wrap(async(req,res)=>{
  const media=detectMedia(req.body);if(!media)return res.status(400).json({error:'Choose a PDF, PNG, JPEG or WebP file.'});
  const id=randomUUID();const key=randomBytes(32).toString('hex');
  // Keep unapproved visitor files in MongoDB; never expose them through public CDN URLs.
  await col('note_uploads').insertOne({_id:id,keyHash:digest(key),bytes:req.body,type:media.type,createdAt:new Date(),expiresAt:new Date(Date.now()+86400000)});
  res.json({id,key});
 }));
 app.get('/api/admin/notes/uploads/:id',adminGuard,wrap(async(req,res)=>{
  const file=await col('note_uploads').findOne({_id:req.params.id});if(!file)return res.sendStatus(404);
  res.set({'Content-Type':file.type,'Content-Disposition':'attachment; filename="review-file"','Cache-Control':'no-store'}).send(Buffer.from(file.bytes.buffer));
 }));
 const send = newsletter?.send || (async(to,subject,text)=>{
  if(!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) throw new Error('Configure RESEND_API_KEY and RESEND_FROM.');
  const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM,to:[to],subject,text}),signal:AbortSignal.timeout(15000)});
  if(!result.ok) throw new Error(`Resend rejected email (${result.status}).`);
 });
 app.get('/api/public/notes',wrap(async(req,res)=>res.json({posts:await col('notes').find({status:'published'},{projection:{_id:1,title:1,category:1,topic:1,author:1,summary:1,body:1,attachments:1,coverUrl:1,resourceType:1,resourceUrl:1,createdAt:1,updatedAt:1}}).sort({updatedAt:-1}).limit(100).toArray()})));
 app.post('/api/public/notes',requireOrigin(publicOrigin),limit,wrap(async(req,res)=>{
  const parsed=post.omit({attachments:true,coverUrl:true}).extend({submissionId:z.string().uuid().optional(),email,consent:z.literal(true), links:z.array(z.string().url().max(2000).refine(isSafeReference)).max(5).default([]),uploads:z.array(z.object({id:z.string().uuid(),key:z.string().length(64),name:z.string().trim().min(1).max(200).refine(value=>[...value].every(char=>char.codePointAt(0)>31&&char.codePointAt(0)!==127))})).max(3).default([])}).refine(data=>new Set(data.uploads.map(file=>file.id)).size===data.uploads.length).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Check the highlighted fields before submitting.',fieldErrors:Object.fromEntries(parsed.error.issues.map(issue=>[issue.path[0]==='uploads'?'files':issue.path[0]||'files',issue.message]))});
  const issue=validateResourcePost(parsed.data);if(issue)return res.status(400).json({error:issue});
  const {uploads,links,submissionId,...fields}=parsed.data;
  const noteId=submissionId||randomUUID();
  const submissionHash=digest(JSON.stringify(parsed.data));
  const receipt={message:'Thank you. Your note is awaiting editorial review.'};
  if(submissionId){
   const existing=await col('notes').findOne({_id:noteId});
   if(existing)return existing.submissionHash===submissionHash?res.status(201).json(receipt):res.status(409).json({error:'This submission changed. Reload the page before submitting again.'});
  }
  const claimed=[];
  let inserted=false;
  try {
   // Consume each upload capability atomically, preventing concurrent reuse.
   for(const file of uploads){
    const found=await col('note_uploads').findOneAndUpdate({_id:file.id,keyHash:digest(file.key),expiresAt:{$gt:new Date()},claimedBy:{$exists:false}},{$set:{claimedBy:noteId},$unset:{expiresAt:'',keyHash:''}},{returnDocument:'before',includeResultMetadata:false});
    if(!found){
     const error=new Error('An upload expired or was already used. Please select the file again.');error.status=400;throw error;
    }
    claimed.push(found);
   }
   const pendingUploads=uploads.map(({id,name})=>({id,name}));
   const createdAt=new Date();
   await col('notes').insertOne({...fields,attachments:[...new Set(links)].map(url=>({url,name:'Reference link',type:'link'})),pendingUploads,_id:noteId,submissionHash,status:'pending',createdAt,updatedAt:createdAt});
   inserted=true;
  }catch(error){
   if(error.code===11000&&submissionId){const existing=await col('notes').findOne({_id:noteId});if(existing?.submissionHash===submissionHash){inserted=true;return res.status(201).json(receipt)}}
   if(error.status===400)return res.status(400).json({error:error.message});
   throw error;
  }finally{
   if(!inserted)for(const file of claimed)await col('note_uploads').updateOne({_id:file._id,claimedBy:noteId},{$set:{keyHash:file.keyHash,expiresAt:file.expiresAt},$unset:{claimedBy:''}});
  }
  res.status(201).json({message:'Thank you. Your note is awaiting editorial review.'});
 }));
 app.post('/api/public/subscribe',requireOrigin(publicOrigin),subscriptionLimit,wrap(async(req,res)=>{
  const parsed=z.object({email,consent:z.literal(true)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Enter a valid email and agree to receive updates.'});
  if(!configured())return res.status(503).json({code:'SUBSCRIPTIONS_UNAVAILABLE',error:'Email updates are temporarily unavailable. Please try again later.'});
  const address=parsed.data.email; const existing=await col('subscribers').findOne({_id:address});
  if(existing?.active)return res.json({message:'If eligible, a confirmation link will arrive in your inbox.'});
  const token=randomBytes(32).toString('hex');
  await col('subscribers').updateOne({_id:address},{$set:{active:false,confirmHash:digest(token),expiresAt:new Date(Date.now()+86400000)}},{upsert:true});
  try { await send(address,'Confirm your Notes subscription',`Confirm your subscription to new and updated technical notes:\n${publicOrigin}/notes?confirm=${token}\nThis link expires in 24 hours. Ignore this email if you did not request it.`); } catch(error) { console.error('Subscription confirmation failed:',error.message); return res.status(502).json({error:'We could not send your confirmation email. Please try again later.'}); }
  res.json({message:'If eligible, a confirmation link will arrive in your inbox.'});
 }));
 app.post('/api/public/subscription',requireOrigin(publicOrigin),subscriptionLimit,wrap(async(req,res)=>{
  const parsed=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),action:z.enum(['confirm','unsubscribe'])}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid subscription link.'});
  const {token,action}=parsed.data;
  const filter=action==='confirm'?{active:false,confirmHash:digest(token),expiresAt:{$gt:new Date()}}:{unsubscribeHash:digest(token)};
  const result=await col('subscribers').updateOne(filter,{$set:{active:action==='confirm'},$unset:{confirmHash:'',expiresAt:''}});
  res.status(result.matchedCount?200:400).json(result.matchedCount?{message:action==='confirm'?'Subscription confirmed. Welcome!':'You have unsubscribed.'}:{error:'This link has expired or has already been used.'});
 }));
 app.get('/api/admin/notes',adminGuard,wrap(async(req,res)=>res.json({posts:await col('notes').find().sort({updatedAt:-1}).limit(200).toArray(),subscribers:await col('subscribers').countDocuments({active:true}),emailConfigured:usesButtondown()?buttondownConfigured():configured(),newsletterProvider:usesButtondown()?'buttondown':'resend'})));
 app.post('/api/admin/notes/newsletter/retry',mutateGuard,wrap(async(req,res)=>{
  const parsed=z.object({id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),expectedVersion:z.number().int().nonnegative()}).strict().safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Select a saved published entry.'});
  const note=await col('notes').findOne({_id:parsed.data.id,status:'published',version:parsed.data.expectedVersion});
  if(!note?.newsletter)return res.status(409).json({error:'No matching notification. Reload this entry.'});
  if(!usesButtondown()||!buttondownConfigured())return res.status(503).json({error:'Buttondown is not configured.'});
  res.json(await deliverNewsletter(col,note._id,note.newsletter));
 }));
 app.post('/api/admin/notes/delete',mutateGuard,wrap(async(req,res)=>{
  const parsed=z.object({id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),expectedVersion:z.number().int().nonnegative()}).strict().safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Select a saved rejected note before deleting.'});
  const {id,expectedVersion}=parsed.data;
  const deleted=await col('notes').findOneAndDelete({_id:id,status:'rejected',...(expectedVersion===0?{$or:[{version:0},{version:{$exists:false}}]}:{version:expectedVersion})});
  if(!deleted)return res.status(409).json({error:'Only rejected notes can be deleted. This entry may have changed; reload the list.'});
  // Do not delete shared Cloudinary assets. Expire private pending uploads after a grace period.
  const ids=(deleted.pendingUploads||[]).map(file=>file.id);
  if(ids.length)await col('note_uploads').updateMany({_id:{$in:ids}},{$set:{expiresAt:new Date(Date.now()+86400000)}}).catch(error=>console.error('Rejected note upload cleanup:',error.message));
  return res.json({message:'Rejected note permanently deleted.'});
 }));
 app.post('/api/admin/notes',mutateGuard,wrap(async(req,res)=>{
  const parsed=post.extend({id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/).optional(),status:z.enum(['draft','published','rejected']),notify:z.boolean().default(false),expectedVersion:z.number().int().nonnegative().optional()}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Check title, author, summary and explanation length.'});
  const issue=validateResourcePost(parsed.data);if(issue)return res.status(400).json({error:issue});
  const {id,notify,expectedVersion,...data}=parsed.data; const key=id||randomUUID();
  if(id && expectedVersion === undefined)return res.status(400).json({error:'Reload the note before saving.'});
  if(id){const current=await col('notes').findOne({_id:id});if(!current)return res.status(404).json({error:'Note no longer exists.'});if((current.version||0)!==expectedVersion)return res.status(409).json({error:'This note changed in another editor. Reload it before saving.'});}
  if(data.status==='published' && id){
   const existing=await col('notes').findOne({_id:id});
   for(const pending of existing?.pendingUploads||[]){
    const file=await col('note_uploads').findOne({_id:pending.id});
    if(!file)throw new Error('A pending attachment is missing.');
    let asset=file.asset;
    if(!asset){asset=await uploadMedia(Buffer.from(file.bytes.buffer));await col('note_uploads').updateOne({_id:pending.id},{$set:{asset}});}
    if(!data.attachments.some(a=>a.url===asset.url)){
    if(data.attachments.length>=8) return res.status(400).json({error:'A note can have at most 8 attachments. Remove one before publishing.'});
    data.attachments.push({url:asset.url,name:pending.name,type:file.type==='application/pdf'?'pdf':'image'});
    }
   }
  }
  if(notify&&data.status==='published'&&usesButtondown()){if(!buttondownConfigured())return res.status(503).json({error:'Configure the Buttondown API key before notifying subscribers.'});data.newsletter=makeNewsletterEvent({id:key,version:(expectedVersion||0)+1,title:data.title,summary:data.summary,publicOrigin:process.env.NEWSLETTER_PUBLIC_ORIGIN||publicOrigin});}
  const filter=id?{_id:key,...(expectedVersion===0?{$or:[{version:0},{version:{$exists:false}}]}:{version:expectedVersion})}:{_id:key};
  const savedAt=new Date();
  const saved=await col('notes').updateOne(filter,{$setOnInsert:{createdAt:savedAt},$set:{...data,version:(expectedVersion||0)+1,updatedAt:savedAt,...(data.status==='published'?{pendingUploads:[]}: {})}},{upsert:!id});
  if(id&&!saved.matchedCount)return res.status(409).json({error:'This note changed during saving. Reload and try again.'});
  if(data.newsletter&&usesButtondown()){const delivery=await deliverNewsletter(col,key,data.newsletter);return res.json({...delivery,id:key,version:(expectedVersion||0)+1,updatedAt:savedAt,attachments:data.attachments});}
  // Delivery is explicit, opt-in, and reports partial failures to the editor.
  let sent=0,failed=0;
  if(notify&&data.status==='published')for await(const subscriber of col('subscribers').find({active:true})){
   const token=subscriber.unsubscribeToken || randomBytes(32).toString('hex');
   await col('subscribers').updateOne({_id:subscriber._id},{$set:{unsubscribeHash:digest(token),unsubscribeToken:token}});
   try{await send(subscriber._id,`Notes: ${data.title}`,`${data.summary}\n\nRead: ${publicOrigin}/notes?post=${key}\n\nUnsubscribe: ${publicOrigin}/notes?unsubscribe=${token}`);sent++;}catch{failed++;}
   await new Promise(resolve=>setTimeout(resolve,600));
  }
  res.json({message:`Saved. Notifications accepted: ${sent}; failed: ${failed}.`,id:key,version:(expectedVersion||0)+1,updatedAt:savedAt,attachments:data.attachments});
 }));
}
