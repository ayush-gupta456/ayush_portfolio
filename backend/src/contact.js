import { createHash } from 'node:crypto';
import { contactSchema } from './schema.js';

const hash=value=>createHash('sha256').update(value).digest('hex');
export const contactDailyLimitMessage='Your daily limit of 2 messages has been reached. Please contact me directly after 6:00 PM IST.';
export function sendContactDailyLimitResponse(res,timestamps,now=new Date()) {
  const oldest=[...timestamps].sort((a,b)=>a-b)[0];
  if(oldest)res.setHeader('Retry-After',String(Math.max(1,Math.ceil((oldest.getTime()+86400000-now.getTime())/1000))));
  return res.status(429).json({code:'CONTACT_DAILY_LIMIT',error:contactDailyLimitMessage});
}

export function registerContact(app,{col,guards,domainAcceptsMail,sendContactEmails,emailJsConfigured}) {
 app.post('/api/public/contact',...guards,async(req,res,next)=>{
  const parsed=contactSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Please check the highlighted fields.',fieldErrors:Object.fromEntries(parsed.error.issues.map(issue=>[issue.path[0],issue.message]))});
  const {submissionId,...values}=parsed.data;
  if(values.website)return res.status(202).json({success:true});
  const {name,subject,message}=values,email=values.email.toLowerCase();
  const receiptId=submissionId?hash(`contact-receipt:${submissionId}`):null;
  const payloadHash=hash(JSON.stringify({name,email,subject,message}));
  let claimed=false,emailAttempted=false;
  const reply=async(status,body)=>{
   if(receiptId&&claimed)await col('api_rate_limits').updateOne({_id:receiptId},{$set:{contactResponse:{status,body}}});
   return res.status(status).json(body);
  };
  try {
   if(receiptId){
    try{await col('api_rate_limits').insertOne({_id:receiptId,payloadHash,expiresAt:new Date(Date.now()+86400000)});claimed=true}
    catch(error){
     if(error.code!==11000)throw error;
     const receipt=await col('api_rate_limits').findOne({_id:receiptId});
     if(receipt?.payloadHash!==payloadHash)return res.status(409).json({error:'This submission changed. Refresh the page before sending it again.'});
     if(receipt.contactResponse)return res.status(receipt.contactResponse.status).json(receipt.contactResponse.body);
     return res.status(202).json({code:'CONTACT_PROCESSING',message:'Your message is still being processed. Please wait before checking again.'});
    }
   }
   let acceptsMail;
   try{acceptsMail=await domainAcceptsMail(email)}catch{return await reply(503,{error:'We could not verify the email domain right now. Try again shortly.',code:'EMAIL_CHECK_UNAVAILABLE'})}
   if(!acceptsMail)return await reply(400,{code:'INVALID_EMAIL_DOMAIN',error:'This email domain cannot receive mail. Check the address and try again.',fieldErrors:{email:'This domain cannot receive email.'}});
   const now=new Date(),cutoff=new Date(now.getTime()-86400000);
   const result=await col('api_rate_limits').findOneAndUpdate({_id:hash(`contact-email:${email}`)},[
    {$set:{recentContactSubmissions:{$filter:{input:{$ifNull:['$recentContactSubmissions',[]]},as:'sentAt',cond:{$gt:['$$sentAt',cutoff]}}}}},
    {$set:{contactLimitReached:{$gte:[{$size:'$recentContactSubmissions'},2]},recentContactSubmissions:{$cond:[{$lt:[{$size:'$recentContactSubmissions'},2]},{$concatArrays:['$recentContactSubmissions',[now]]},'$recentContactSubmissions']},expiresAt:new Date(now.getTime()+90000000)}}
   ],{upsert:true,returnDocument:'after',includeResultMetadata:false});
   if(result.contactLimitReached){
    const body={code:'CONTACT_DAILY_LIMIT',error:contactDailyLimitMessage};
    if(receiptId)await col('api_rate_limits').updateOne({_id:receiptId},{$set:{contactResponse:{status:429,body}}});
    return sendContactDailyLimitResponse(res,result.recentContactSubmissions,now);
   }
   // Persist only contact details; message content is used in memory for delivery.
   await col('contact_messages').insertOne({name,email});
   emailAttempted=true;
   const delivery=emailJsConfigured?await sendContactEmails({name,email,subject,message}):{mainSent:false,autoReplySent:false};
   const emailSent=delivery.mainSent&&delivery.autoReplySent;
   const responseMessage=emailSent?'Your message was sent to Ayush, and a confirmation email was sent to you.':delivery.mainSent?'Your message reached Ayush, but the confirmation email could not be sent.':delivery.autoReplySent?'A confirmation email was sent, but Ayush’s notification could not be delivered. Please email him directly if your message is urgent.':'Your contact details were saved, but neither email could be delivered. Please email Ayush directly.';
   return await reply(201,{success:true,contactEmailContract:'v1',emailSent,emailDelivery:{ownerNotification:delivery.mainSent,senderConfirmation:delivery.autoReplySent},message:responseMessage});
  }catch(error){
   if(receiptId&&claimed&&!emailAttempted)await col('api_rate_limits').deleteOne({_id:receiptId}).catch(()=>{});
   return next(error);
  }
 });
}
