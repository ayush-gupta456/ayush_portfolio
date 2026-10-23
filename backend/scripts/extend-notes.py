from pathlib import Path
p=Path('backend/src/notes.js');s=p.read_text(encoding='utf-8-sig');s="import express from 'express';\nimport { detectMedia, uploadMedia } from './media.js';\n"+s
s=s.replace("const post = z.object", "const attachment = z.object({name:z.string().max(200),url:z.string().url().max(2000).refine(v=>v.startsWith('https://')),type:z.enum(['pdf','image','link'])});\nconst post = z.object")
s=s.replace("body:z.string().trim().min(100).max(30000)","body:z.string().trim().min(100).max(30000), attachments:z.array(attachment).max(8).default([]), topic:z.string().max(100).default('')")
needle=" const send = async"
s=s.replace(needle,""" const uploadLimit=persistentRateLimit({name:'notes-upload',limit:4,windowMs:3600000});
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
"""+needle)
s=s.replace("post.extend({email,consent:z.literal(true)})","post.omit({attachments:true}).extend({email,consent:z.literal(true), links:z.array(z.string().url().max(2000).refine(v=>v.startsWith('https://'))).max(5).default([]),uploads:z.array(z.object({id:z.string().uuid(),key:z.string().length(64),name:z.string().max(200)})).max(3).default([])})")
s=s.replace("await col('notes').insertOne({...parsed.data,_id:randomUUID(),status:'pending',updatedAt:new Date()});","""const {uploads,links,...fields}=parsed.data;
  for(const file of uploads){const found=await col('note_uploads').findOne({_id:file.id,keyHash:digest(file.key),expiresAt:{$gt:new Date()}});if(!found)return res.status(400).json({error:'An upload expired. Please select it again.'});}
  const pendingUploads=uploads.map(({id,name})=>({id,name}));
  await col('notes').insertOne({...fields,attachments:links.map(url=>({url,name:'Reference link',type:'link'})),pendingUploads,_id:randomUUID(),status:'pending',updatedAt:new Date()});
  for(const file of uploads)await col('note_uploads').updateOne({_id:file.id},{$unset:{expiresAt:'',keyHash:''}});""")
s=s.replace("projection:{email:0}","projection:{email:0,pendingUploads:0,consent:0}")
s=s.replace("const key=id||randomUUID();", """const key=id||randomUUID();
  if(data.status==='published' && id){
   const existing=await col('notes').findOne({_id:id});
   for(const pending of existing?.pendingUploads||[]){
    const file=await col('note_uploads').findOne({_id:pending.id});
    if(!file)throw new Error('A pending attachment is missing.');
    let asset=file.asset;
    if(!asset){asset=await uploadMedia(Buffer.from(file.bytes.buffer));await col('note_uploads').updateOne({_id:pending.id},{$set:{asset}});}
    if(!data.attachments.some(a=>a.url===asset.url))data.attachments.push({url:asset.url,name:pending.name,type:file.type==='application/pdf'?'pdf':'image'});
   }
  }""")
s=s.replace("{$set:{...data,updatedAt:new Date()}},{upsert:true})","{$set:{...data,updatedAt:new Date(),...(data.status==='published'?{pendingUploads:[]}: {})}},{upsert:true})")
p.write_text(s,encoding='utf-8')
