import {useState} from 'react';
import {isSafeReference} from '../../shared/note-rules.js';

function CoverPreview({url}) {
 const [failed,setFailed]=useState(false);
 return <div className="note-cover-preview">
  {failed ? <p role="status">This image could not load. Replace it or check its URL.</p> : <img src={url} alt="Note card cover preview" onError={()=>setFailed(true)} referrerPolicy="no-referrer"/>}
 </div>;
}

export default function NoteCover({url,onChange,onUpload}) {
 const safeUrl=url.trim()&&isSafeReference(url.trim());
 return <section className="note-cover-editor" aria-labelledby="note-cover-heading">
  <header><h4 id="note-cover-heading">Card cover <span>(optional)</span></h4><span className="note-cover-badge">Image only</span></header>
  <p id="note-cover-help">Choose an image for the note card. PDF and reference attachments are managed separately below. Landscape images work best; 1600 × 900 px is recommended.</p>
  {safeUrl ? <CoverPreview key={url.trim()} url={url.trim()}/> : <div className="note-cover-placeholder">No cover selected. The card will use its default artwork.</div>}
  <label>{url?'Replace cover image':'Upload cover image'}<input type="file" accept=".png,.jpg,.jpeg,.webp" aria-describedby="note-cover-help note-cover-formats" onChange={onUpload}/></label>
  <p id="note-cover-formats">PNG, JPEG or WebP · Maximum 10 MB. Save entry to apply your changes.</p>
  {url&&<button className="text-button" type="button" onClick={()=>onChange('')}>Remove cover image</button>}
  <details><summary>Or use an image URL</summary><label>Cover image URL (optional)<input type="url" maxLength={2000} value={url} onChange={event=>onChange(event.target.value)} placeholder="https://…"/></label></details>
 </section>;
}
