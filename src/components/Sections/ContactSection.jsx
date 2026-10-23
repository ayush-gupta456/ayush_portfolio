import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, LoaderCircle, MapPin, Phone, Send } from 'lucide-react';
import { profile } from '../../data/profile';
import { validateContactFields } from '../../../shared/contact-rules.js';
import { API_BASE } from '../../../shared/browser-config.js';
const labels={name:'Name',email:'Email',subject:'Subject',message:'Message'};

export default function ContactSection() {
 const [copyState,setCopyState]=useState('');
 const [status,setStatus]=useState(null),[errors,setErrors]=useState({}),[isSubmitting,setIsSubmitting]=useState(false),[count,setCount]=useState(0);
 const lock=useRef(false),attempt=useRef(null),copyTimer=useRef(null),controller=useRef(null),feedback=useRef(null),shouldFocus=useRef(false);
 useEffect(()=>()=>{clearTimeout(copyTimer.current);controller.current?.abort()},[]);
 useEffect(()=>{if(shouldFocus.current){shouldFocus.current=false;feedback.current?.focus()}},[status,errors]);
 async function copyEmail(){try{await navigator.clipboard.writeText(profile.email);setCopyState('copied')}catch{setCopyState('unavailable')}clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopyState(''),2500)}
 const inputProps=name=>({name,id:`contact-${name}`,'aria-invalid':errors[name]?true:undefined,'aria-describedby':errors[name]?`contact-error-${name}`:name==='message'?'contact-message-count':undefined});
 async function handleSubmit(event){
  event.preventDefault();if(lock.current)return;
  const form=event.currentTarget;
  const values=Object.fromEntries(new FormData(form));
  for(const name of Object.keys(labels))values[name]=values[name].trim();
  const issues=validateContactFields(values);setStatus(null);shouldFocus.current=true;setErrors(issues);
  if(Object.keys(issues).length)return;
  const fingerprint=JSON.stringify(values);
  if(attempt.current?.fingerprint!==fingerprint)attempt.current={fingerprint,id:crypto.randomUUID()};
  lock.current=true;setIsSubmitting(true);controller.current=new AbortController();
  const timeout=setTimeout(()=>controller.current?.abort(),90000);
  try{
   const response=await fetch(`${API_BASE}/public/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,submissionId:attempt.current.id}),signal:controller.current.signal});
   const result=await response.json().catch(()=>null);
   if(!response.ok){
    // A definite rejection has not sent email, so a later corrected attempt can start fresh.
    if([400,403,409,413,429].includes(response.status)||result?.code==='EMAIL_CHECK_UNAVAILABLE')attempt.current=null;
    setErrors(Object.fromEntries(Object.entries(result?.fieldErrors||{}).filter(([name])=>name in labels)));
    if(result?.code==='INVALID_EMAIL_DOMAIN')setErrors({email:result.error});
    const retry=Number(response.headers.get('Retry-After'));
    setStatus({tone:response.status===429?'limit':'error',message:result?.error||(response.status===429?`Too many attempts. Please try again${retry>0?` in ${Math.ceil(retry/60)} minutes`:' later'}.`:'The service is unavailable. Your form has been kept. Please try again.'),directEmail:true});return;
   }
   if(result?.code==='CONTACT_PROCESSING'){setStatus({tone:'warning',message:result.message,directEmail:true});return}
   const known=result?.contactEmailContract==='v1'&&typeof result.emailSent==='boolean'&&typeof result.emailDelivery?.ownerNotification==='boolean'&&typeof result.emailDelivery?.senderConfirmation==='boolean';
   if(!known){setStatus({tone:'warning',message:'The request was accepted, but email delivery could not be confirmed. Your form has been kept. Please contact me directly if needed.',directEmail:true});return}
   if(result.emailSent){form.reset();setCount(0);attempt.current=null}
   setStatus({tone:result.emailSent?'success':'warning',message:result.message,directEmail:!result.emailSent});
  }catch(error){
   setStatus({tone:'error',message:error.name==='AbortError'?'Delivery could not be confirmed before the request timed out. Your form has been kept. Checking again with the same content will not send another copy.':'Could not connect to the service. Your form has been kept; check your connection and try again.',directEmail:true});
  }finally{clearTimeout(timeout);controller.current=null;lock.current=false;setIsSubmitting(false);shouldFocus.current=true;setErrors(current=>({...current}))}
 }
 return <section id="contact" className="section-block page-wrap contact-section"><div className="contact-panel" data-glass>
  <div className="contact-copy"><span className="section-index">06 / CONTACT</span><h2>Have something<br/><span>good in mind?</span></h2><p>I’m always glad to hear about thoughtful products, interesting challenges, and new people to learn from.</p><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={17} aria-hidden="true"/></a><button className="copy-button" onClick={copyEmail} type="button">{copyState==='copied'?<Check size={15} aria-hidden="true"/>:<Copy size={15} aria-hidden="true"/>}{copyState==='copied'?'Copied to clipboard':'Copy email'}</button><span className="copy-feedback" role="status">{copyState==='unavailable'?'Copy unavailable. Use the email link above.':''}</span><div className="contact-details"><span><MapPin size={15} aria-hidden="true"/>{profile.location}</span><a href={`tel:${profile.phone.replaceAll(' ','')}`}><Phone size={15} aria-hidden="true"/>{profile.phone}</a></div><div className="contact-socials"><a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><Github size={18}/></a><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><Linkedin size={18}/></a></div></div>
  <form className="contact-form" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} onInput={event=>{const name=event.target.name;setErrors(current=>{if(!current[name])return current;const next={...current};delete next[name];return next});if(name==='message')setCount(event.target.value.trim().length);setStatus(null)}}>
   <h3 className="form-title">Send a message</h3><p className="contact-form-hint">All fields are required. Up to 2 messages per email in 24 hours.</p>
   {(status||Object.keys(errors).length>0)&&<div ref={feedback} tabIndex={-1} className={`form-status form-status-${status?.tone||'error'}`} role={status?.tone==='success'?'status':'alert'}>{Object.keys(errors).length>0&&<><strong>Please check these fields</strong><ul>{Object.entries(errors).map(([name,error])=><li key={name}><a href={`#contact-${name}`} onClick={event=>{event.preventDefault();document.getElementById(`contact-${name}`)?.focus()}}>{labels[name]}: {error}</a></li>)}</ul></>}{status&&<p>{status.message}{status.directEmail&&<> <a href={`mailto:${profile.email}`}>Email me directly</a>.</>}</p>}</div>}
   <fieldset className="contact-fields" disabled={isSubmitting}><legend className="sr-only">Contact details and message</legend>
    <div className="form-trap" aria-hidden="true"><label>Leave this field blank<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label htmlFor="contact-name">Name<input {...inputProps('name')} type="text" autoComplete="name" placeholder="Your name" required maxLength={100}/>{errors.name&&<small id="contact-error-name" className="contact-field-error">{errors.name}</small>}</label>
    <label htmlFor="contact-email">Email<input {...inputProps('email')} type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder="you@example.com" required maxLength={254}/>{errors.email&&<small id="contact-error-email" className="contact-field-error">{errors.email}</small>}</label>
    <label htmlFor="contact-subject">Subject<input {...inputProps('subject')} type="text" placeholder="What would you like to talk about?" required maxLength={120}/>{errors.subject&&<small id="contact-error-subject" className="contact-field-error">{errors.subject}</small>}</label>
    <label htmlFor="contact-message">Message<textarea {...inputProps('message')} rows={5} placeholder="A little context goes a long way…" required maxLength={3000}/>{errors.message&&<small id="contact-error-message" className="contact-field-error">{errors.message}</small>}<small id="contact-message-count" className="contact-counter">{count.toLocaleString()}/3,000 characters</small></label>
    <button className="button button-primary form-submit" type="submit" disabled={isSubmitting}>{isSubmitting?<LoaderCircle className="contact-spinner" size={17} aria-hidden="true"/>:<Send size={16} aria-hidden="true"/>}{isSubmitting?'Sending message…':'Send message'}</button>
   </fieldset><p className="contact-submit-status" role="status">{isSubmitting?'Sending your message and confirmation email. This may take a moment.':''}</p>
   <p className="form-note">Only your name and email are saved for contact management. Your message is used for email delivery.</p>
  </form>
 </div></section>;
}
