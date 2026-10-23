from pathlib import Path
p=Path('backend/src/notes.js');s=p.read_text(encoding='utf-8');s="import { buttondownConfigured, makeNewsletterEvent, deliverNewsletter } from './buttondown.js';\n"+s;s=s.replace(" const configured=", " const usesButtondown=()=>process.env.NEWSLETTER_PROVIDER==='buttondown';\n const configured=");s=s.replace("emailConfigured:configured()", "emailConfigured:usesButtondown()?buttondownConfigured():configured(),newsletterProvider:usesButtondown()?'buttondown':'resend'")
s=s.replace("  const filter=id?{_id:key", "  if(notify&&data.status==='published'&&usesButtondown()){if(!buttondownConfigured())return res.status(503).json({error:'Configure the Buttondown API key before notifying subscribers.'});data.newsletter=makeNewsletterEvent({id:key,version:(expectedVersion||0)+1,title:data.title,summary:data.summary,publicOrigin});}\n  const filter=id?{_id:key")
s=s.replace("  // Delivery is explicit", "  if(data.newsletter&&usesButtondown()){const message=await deliverNewsletter(col,key,data.newsletter);return res.json({message,id:key});}\n  // Delivery is explicit")
needle=" app.post('/api/admin/notes/delete'"
s=s.replace(needle,""" app.post('/api/admin/notes/newsletter/retry',mutateGuard,wrap(async(req,res)=>{
  const parsed=z.object({id:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),expectedVersion:z.number().int().nonnegative()}).strict().safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Select a saved published entry.'});
  const note=await col('notes').findOne({_id:parsed.data.id,status:'published',version:parsed.data.expectedVersion});
  if(!note?.newsletter)return res.status(409).json({error:'No matching notification. Reload this entry.'});
  if(!usesButtondown()||!buttondownConfigured())return res.status(503).json({error:'Buttondown is not configured.'});
  res.json({message:await deliverNewsletter(col,note._id,note.newsletter)});
 }));
"""+needle)
p.write_text(s,encoding='utf-8')
p=Path('admin/src/NotesAdmin.jsx');s=p.read_text(encoding='utf-8');s=s.replace("<p>{data.subscribers} confirmed subscribers · Email {data.emailConfigured?'configured':'not configured'}</p>","<p>{data.newsletterProvider==='buttondown'?'Buttondown manages newsletter subscribers':`${data.subscribers} confirmed subscribers`} · Notifications {data.emailConfigured?'configured':'not configured'}</p>{data.newsletterProvider==='buttondown'&&<a className=\"text-button\" href=\"https://buttondown.com/subscribers\" target=\"_blank\" rel=\"noopener noreferrer\">Manage subscribers in Buttondown ↗</a>}")
s=s.replace("Notify confirmed subscribers about this publication or update", "{data.newsletterProvider==='buttondown'?'Queue a Buttondown email for subscribers when I save':'Notify confirmed subscribers about this publication or update'}")
s=s.replace("<h4>Attachments</h4>", """{data.posts.find(p=>p._id===draft.id)?.newsletter&&<div className="notebook-notification"><strong>Newsletter: {data.posts.find(p=>p._id===draft.id).newsletter.state}</strong><p>{data.posts.find(p=>p._id===draft.id).newsletter.error||'Check Buttondown for delivery progress.'}</p>{['failed','pending'].includes(data.posts.find(p=>p._id===draft.id).newsletter.state)&&<button className="text-button" type="button" disabled={busy||dirty} onClick={async()=>{setBusy(true);setError('');try{const r=await request('/admin/notes/newsletter/retry',{csrf,method:'POST',body:JSON.stringify({id:draft.id,expectedVersion:draft.expectedVersion})});setMessage(r.message);setData(await request('/admin/notes'))}catch(e){setError(e.message)}finally{setBusy(false)}}}>Retry same notification</button>}</div>}<h4>Attachments</h4>""")
p.write_text(s,encoding='utf-8')
