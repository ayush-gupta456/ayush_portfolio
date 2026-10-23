import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileText, LoaderCircle, Upload, X } from 'lucide-react';
import { validateNoteFields } from '../shared/note-rules.js';
import { notesRequest } from './notes-api.js';

const categories = ['Engineering','Web','Data','Cloud','Tech','Posts'];
const resources = {video:'YouTube video',channel:'YouTube channel',repository:'GitHub repository',app:'App or tool',other:'Other resource'};
const fieldLabels = {author:'Your name',email:'Email',title:'Title',category:'Category',topic:'Topic',resourceUrl:'Resource URL',summary:'Short summary',body:'Explanation',files:'Attachments',links:'Reference links',consent:'Publication consent'};
const maxBytes = 10 * 1024 * 1024;

async function validFile(file) {
  if (!file.size || file.size > maxBytes || file.name.length > 200 || [...file.name].some(char=>char.codePointAt(0)<32||char.codePointAt(0)===127) || !/\.(pdf|png|jpe?g|webp)$/i.test(file.name)) return false;
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  return /\.pdf$/i.test(file.name) ? text.startsWith('%PDF-') : /\.png$/i.test(file.name) ? [137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b) : /\.jpe?g$/i.test(file.name) ? bytes[0]===255 && bytes[1]===216 && bytes[2]===255 : text.startsWith('RIFF') && text.slice(8,12)==='WEBP';
}

function Field({name,label,error,hint,children}) {
  return <div className="note-form-field"><label htmlFor={`contribute-${name}`}>{label}</label>{children}{hint&&<small id={`hint-${name}`} className="note-field-hint">{hint}</small>}{error&&<small className="note-field-error" id={`error-${name}`}>{error}</small>}</div>;
}

export default function NoteContribution({topics}) {
  const [category,setCategory] = useState('Engineering');
  const [files,setFiles] = useState([]);
  const [errors,setErrors] = useState({});
  const [status,setStatus] = useState('');
  const [failure,setFailure] = useState('');
  const [success,setSuccess] = useState('');
  const [busy,setBusy] = useState(false);
  const [checkingFiles,setCheckingFiles] = useState(false);
  const pendingFocus=useRef(false), fileLock=useRef(false);
  const [counts,setCounts] = useState({summary:0,body:0});
  const lock = useRef(false), cache = useRef(new Map()), attempt = useRef(null), summary = useRef(null), result = useRef(null);
  useEffect(()=>{if(!pendingFocus.current)return;pendingFocus.current=false;if(Object.keys(errors).length || failure) summary.current?.focus(); else if(success) result.current?.focus()},[errors,failure,success]);
  const props = (name,extra={}) => ({name,id:`contribute-${name}`,'aria-invalid':errors[name]?true:undefined,'aria-describedby':[extra.hint?`hint-${name}`:'',errors[name]?`error-${name}`:''].filter(Boolean).join(' ')||undefined,...Object.fromEntries(Object.entries(extra).filter(([key])=>key!=='hint'))});
  function clearError(name) { setErrors(current=>{if(!current[name])return current;const next={...current};delete next[name];return next}); }
  async function submit(event) {
    event.preventDefault();
    if(lock.current||fileLock.current)return;
    const form=event.currentTarget;
    const data=Object.fromEntries(new FormData(form));
    for(const key of ['author','email','title','summary','body','topic','resourceUrl']) if(typeof data[key]==='string')data[key]=data[key].trim();
    data.consent=data.consent==='on';
    data.links=[...new Set((data.links||'').split('\n').map(value=>value.trim()).filter(Boolean))];
    delete data.files;
    const issues=validateNoteFields(data);
    if(files.length>3)issues.files='Choose up to three files.';
    pendingFocus.current=true;setSuccess('');setFailure('');setErrors(issues);
    if(Object.keys(issues).length)return;
    lock.current=true;setBusy(true);
    try {
      data.uploads=[];
      for(const [index,file] of files.entries()) {
        setStatus(`Uploading attachment ${index+1} of ${files.length}…`);
        let asset=cache.current.get(file);
        if(!asset){asset=await notesRequest('notes/upload',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file});cache.current.set(file,asset)}
        data.uploads.push({...asset,name:file.name});
      }
      const fingerprint=JSON.stringify(data);
      if(attempt.current?.fingerprint!==fingerprint)attempt.current={fingerprint,id:crypto.randomUUID()};
      if(new TextEncoder().encode(JSON.stringify({...data,submissionId:attempt.current.id})).byteLength>64*1024)throw Error('The text is too large to submit. Shorten the explanation or reference links and try again.');
      setStatus('Submitting for editorial review…');
      const response=await notesRequest('notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,submissionId:attempt.current.id})});
      form.reset();setCategory('Engineering');setFiles([]);cache.current.clear();attempt.current=null;setCounts({summary:0,body:0});pendingFocus.current=true;setSuccess(response.message);
    } catch(error) {
      if(error.message.includes('upload expired')||error.message.includes('already used'))cache.current.clear();
      pendingFocus.current=true;setErrors(Object.fromEntries(Object.entries(error.fieldErrors||{}).filter(([name])=>name in fieldLabels)));setFailure(error.message);
    } finally { lock.current=false;setBusy(false);setStatus(''); }
  }
  return <section id="contribute" className="notes-contribute"><div><span className="notes-kicker">YOUR PERSPECTIVE MATTERS</span><h2>What did you<br/>learn today?</h2><p>Share an explanation, a practical note, or a technology discovery. Ayush reviews every submission before it appears here.</p><ul className="note-review-steps"><li><span>01</span> Write a note or recommend a resource</li><li><span>02</span> Add optional files and references</li><li><span>03</span> Submit for editorial review</li></ul><p>Your name appears with approved entries. Your email stays private. Only upload files you have permission to share.</p></div>
    <form className="note-contribution-form" noValidate onSubmit={submit} aria-busy={busy} onInput={event=>{setSuccess('');clearError(event.target.name);if(['summary','body'].includes(event.target.name))setCounts(current=>({...current,[event.target.name]:event.target.value.trim().length}))}}>
      <div className="note-form-intro"><h3>Share with the notebook</h3><p>Fields marked * are required. Files and links are optional.</p></div>
      {(Object.keys(errors).length>0||failure)&&<div className="notes-feedback is-error note-error-summary" ref={summary} tabIndex={-1} role="alert"><strong>{failure?'Submission needs attention':'Please check these fields'}</strong>{failure&&<p>{failure}</p>}{Object.keys(errors).length>0&&<ul>{Object.entries(errors).map(([name,error])=><li key={name}><a href={`#contribute-${name}`} onClick={event=>{event.preventDefault();document.getElementById(`contribute-${name}`)?.focus()}}>{fieldLabels[name]}: {error}</a></li>)}</ul>}</div>}
      {success&&<div className="notes-feedback note-form-success" ref={result} tabIndex={-1} role="status"><CheckCircle2 size={22} aria-hidden="true"/><span>{success}</span></div>}
      <fieldset className="notes-submission-fields" disabled={busy}><legend className="notes-sr-only">Share a note or resource post</legend>
        <div className="notes-fields"><Field name="author" label="Your name *" error={errors.author}><input {...props('author')} required minLength={2} maxLength={80} autoComplete="name"/></Field><Field name="email" label="Email *" error={errors.email} hint="Used for this submission; never shown publicly."><input {...props('email',{hint:true})} type="email" required maxLength={254} autoComplete="email" inputMode="email" spellCheck={false}/></Field></div>
        <Field name="title" label="Title *" error={errors.title}><input {...props('title')} required minLength={5} maxLength={160} placeholder="A clear title for what you learned"/></Field>
        <div className="notes-fields"><Field name="category" label="Category *" error={errors.category}><select {...props('category')} value={category} onChange={event=>{setCategory(event.target.value);setErrors({});setFailure('')}}>{categories.map(value=><option key={value}>{value}</option>)}</select></Field><Field name="topic" label="Topic (optional)" error={errors.topic}><input {...props('topic')} maxLength={100} list="note-topics" placeholder="e.g. SAP Commerce"/><datalist id="note-topics">{topics.map(topic=><option key={topic} value={topic}/>)}</datalist></Field></div>
        {category==='Posts'&&<fieldset className="notes-resource-fields"><legend>Recommend a resource</legend><Field name="resourceType" label="Resource type"><select {...props('resourceType')}>{Object.entries(resources).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field><Field name="resourceUrl" label="Resource URL (optional)" error={errors.resourceUrl} hint="Use the full HTTPS link to the video, channel, repository, or app."><input {...props('resourceUrl',{hint:true})} type="url" maxLength={2000} placeholder="https://…" spellCheck={false}/></Field></fieldset>}
        <Field name="summary" label="Short summary *" error={errors.summary} hint={`${counts.summary}/400 characters · minimum 20`}><textarea {...props('summary',{hint:true})} required minLength={20} maxLength={400} rows={3}/></Field>
        <Field name="body" label={category==='Posts'?'Why is this resource useful? *':'Your note *'} error={errors.body} hint={`${counts.body.toLocaleString()}/30,000 characters · minimum ${category==='Posts'?20:100}`}><textarea {...props('body',{hint:true})} required minLength={category==='Posts'?20:100} maxLength={30000} rows={8}/></Field>
        <div className="note-upload-zone"><Upload size={22} aria-hidden="true"/><Field name="files" label="PDFs or images (optional)" error={errors.files} hint="Up to 3 files, 10 MB each. PDF, PNG, JPEG, or WebP."><input {...props('files',{hint:true})} type="file" disabled={checkingFiles} multiple accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={async event=>{const selected=[...event.target.files];event.target.value='';if(fileLock.current)return;if(files.length+selected.length>3){setErrors(current=>({...current,files:'Choose up to three files. Remove a file before adding more.'}));return}fileLock.current=true;setCheckingFiles(true);try{for(const file of selected)if(!await validFile(file))throw Error('Choose non-empty PDF, PNG, JPEG or WebP files under 10 MB, with filenames under 200 characters.');setFiles(current=>[...current,...selected]);clearError('files')}catch(error){setErrors(current=>({...current,files:error.message}))}finally{fileLock.current=false;setCheckingFiles(false)}}}/></Field></div>
        {files.length>0&&<ul className="note-selected-files">{files.map((file,index)=><li key={`${file.name}-${index}`}><FileText size={18} aria-hidden="true"/><span>{file.name}<small>{(file.size/1024/1024).toFixed(2)} MB</small></span><button type="button" aria-label={`Remove ${file.name}`} onClick={()=>{cache.current.delete(file);setFiles(current=>current.filter((_,i)=>i!==index));clearError('files')}}><X size={18} aria-hidden="true"/></button></li>)}</ul>}
        <Field name="links" label="Reference links (optional)" error={errors.links} hint="Up to 5 HTTPS links, one per line."><textarea {...props('links',{hint:true})} rows={3} maxLength={10004} placeholder="https://example.com/resource" spellCheck={false}/></Field>
        <label className="notes-consent" htmlFor="contribute-consent"><input {...props('consent')} type="checkbox" required/> I wrote this explanation, credited my sources, and agree to publication after review.</label>{errors.consent&&<small className="note-field-error" id="error-consent">{errors.consent}</small>}
        <button type="submit" className="notes-button note-submit" disabled={busy||checkingFiles}>{busy?<><LoaderCircle size={18} className="note-submit-spinner" aria-hidden="true"/>Submitting…</>:'Submit for review ↗'}</button>
      </fieldset><p className="note-submit-status" role="status" aria-live="polite">{checkingFiles?'Checking attachments…':status||'Submissions appear publicly only after approval.'}</p>
    </form></section>;
}
