import {createHash} from 'node:crypto';
export const buttondownConfigured=()=>Boolean(process.env.BUTTONDOWN_API_KEY?.trim());
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function makeNewsletterEvent({id,version,title,summary,publicOrigin}){
 const url=new URL('/notes',publicOrigin);url.searchParams.set('post',id);
 return {key:createHash('sha256').update(`${id}:${version}`).digest('hex'),state:'pending',requestedAt:new Date(),payload:{subject:`Tech Notes: ${title}`,body:`<!-- buttondown-editor-mode: fancy --><h1>${escape(title)}</h1><p>${escape(summary)}</p><p><a href="${escape(url.href)}">Read the note and open its resources</a></p><p>Happy learning,<br>Ayush Gupta</p>`,status:'about_to_send'}};
}
export async function sendButtondownEvent(event,{fetcher=fetch,apiKey=process.env.BUTTONDOWN_API_KEY}={}){
 if(!apiKey?.trim())throw Error('Add BUTTONDOWN_API_KEY to the backend environment.');
 const payload={...event.payload};
 if(process.env.NEWSLETTER_PUBLIC_ORIGIN){
  const site=new URL(process.env.NEWSLETTER_PUBLIC_ORIGIN);
  if(site.protocol!=='https:')throw Error('NEWSLETTER_PUBLIC_ORIGIN must use HTTPS.');
  payload.body=payload.body.replace(/href="(https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/notes\?post=[^"]+)"/g,(_match,link)=>{const local=new URL(link);return `href="${escape(site.origin+local.pathname+local.search)}"`});
 }
 const response=await fetcher('https://api.buttondown.com/v1/emails',{method:'POST',headers:{Authorization:`Token ${apiKey}`,'Content-Type':'application/json','X-Idempotency-Key':`${event.key}-confirmed-v2`,'X-API-Version':'2026-04-01',...(event.payload.status==='about_to_send'?{'X-Buttondown-Live-Dangerously':'true'}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});
 if(!response.ok){
  const body=response.json?await response.json().catch(()=>({})):{};
  const code=typeof body.code==='string'?body.code.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100):'';
  const detail=typeof body.detail==='string'?body.detail.replace(/[\r\n]+/g,' ').slice(0,400):'Check API access, account approval and plan limits.';
  throw Error(`Buttondown rejected the notification (HTTP ${response.status}${code?`, ${code}`:''}). ${detail}`);
 }
 const result=await response.json();if(!result.id)throw Error('Buttondown returned no email identifier. Check its dashboard before retrying.');
 return {emailId:result.id,state:'queued',acceptedAt:new Date()};
}
export async function deliverNewsletter(col,id,event){
 if(event.state==='queued')return {message:'This notification is already queued in Buttondown.',notificationState:'queued'};
 try{const result=await sendButtondownEvent(event);await col('notes').updateOne({_id:id,'newsletter.key':event.key},{$set:{newsletter:{...event,...result}}});return {message:'Note saved. Buttondown accepted the subscriber notification. Inbox delivery is not yet confirmed.',notificationState:'queued'}}
 catch(error){await col('notes').updateOne({_id:id,'newsletter.key':event.key},{$set:{'newsletter.state':'failed','newsletter.error':error.message}});return {message:`Note saved, but the notification was not confirmed. ${error.message} Retry this notification from the editor.`,notificationState:'failed'}}
}
