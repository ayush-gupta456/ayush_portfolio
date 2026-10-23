import {config} from 'dotenv';
import {readFile,writeFile} from 'node:fs/promises';
import {MongoClient} from 'mongodb';
import {uploadMedia} from '../src/media.js';
config({path:new URL('../.env',import.meta.url),quiet:true});
const report=JSON.parse(await readFile(new URL('../migrations/sap-review.json',import.meta.url),'utf8'));
const path=new URL('../migrations/sap-cloudinary.json',import.meta.url);let ledger={};try{ledger=JSON.parse(await readFile(path,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:15000});
function topic(n){n=n.toLowerCase();if(/cronjob|process/.test(n))return 'Automation & workflows';if(/impex|flexible|transaction/.test(n))return 'Data & transactions';if(/wcms|pcm|pricing|personalization/.test(n))return 'Content & commerce';if(/occ/.test(n))return 'APIs & integration';if(/extension|architecture|achitecture|layers|ext_|commands/.test(n))return 'Architecture & extensions';return 'Foundations & revision';}
try{await client.connect();const db=client.db(process.env.MONGODB_DB_NAME||'ayush_portfolio');await db.collection('note_uploads').createIndex({expiresAt:1},{expireAfterSeconds:0});
for(const item of report){if(item.name.endsWith('.zip'))continue;
if((item.text||'').replace(/[^a-zA-Z]/g,'').length<200 || (/confidential/i.test(item.text||'') || /curriculum|timetable|handbook|layers/i.test(item.name))){console.log(`HELD LOCAL: ${item.name}`);continue;}
const ext=item.name.split('.').pop().toLowerCase();const bytes=await readFile(item.file);
try{
if(!ledger[item.sha256]){const meta=['xlsx','pptx','txt'].includes(ext)?{ext,type:ext==='txt'?'text/plain':'application/octet-stream',resource:'raw'}:null;ledger[item.sha256]=await uploadMedia(bytes,meta);await writeFile(path,JSON.stringify(ledger,null,2));}
const asset=ledger[item.sha256];const title=item.name.replace(/\.[^.]+$/,'').replaceAll('_',' ');
const scanned=(item.text||'').replace(/[^a-zA-Z]/g,'').length<200;
const needsReview=scanned||/confidential|curriculum|timetable|handbook|layers/i.test((item.text||'').slice(0,3000)+' '+item.name);
const group=topic(item.name);
const summary=`SAP Commerce learning resource covering ${group.toLowerCase()}. ${item.pages?`${item.pages} pages. `:''}Open the original ${ext.toUpperCase()} document to study the material.`;
await db.collection('notes').updateOne({_id:`sap-${item.sha256.slice(0,24)}`},{$setOnInsert:{title,category:'Engineering',topic:group,author:'SAP study collection',summary,body:`${summary}\n\nThis resource is part of the SAP Commerce / Hybris study collection. Source document: ${item.name}. Original attribution and version-specific guidance are retained in the attachment. Check examples against the SAP Commerce version you use.`,attachments:[{name:item.name,url:asset.url,type:ext==='pdf'?'pdf':ext==='png'?'image':'file'}],status:needsReview?'draft':'published',createdAt:new Date(),updatedAt:new Date(),reviewNote:needsReview?'Needs visual or attribution review before publication.':'Text extracted for organization; technical examples not independently validated.'}},{upsert:true});console.log(`${needsReview?'DRAFT':'PUBLISHED'}: ${item.name}`);
}catch(e){console.log(`FAILED: ${item.name}: ${e.message}`);}
}
}finally{await client.close();}
