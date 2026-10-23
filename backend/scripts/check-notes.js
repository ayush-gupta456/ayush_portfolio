import {config} from 'dotenv';import {MongoClient} from 'mongodb';
config({path:new URL('../.env',import.meta.url),quiet:true});
const c=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{await c.connect();const posts=await c.db(process.env.MONGODB_DB_NAME||'ayush_portfolio').collection('notes').find({},{projection:{title:1,status:1,attachments:1}}).toArray();console.log(JSON.stringify(posts,null,2));for(const p of posts)for(const a of p.attachments||[])if(a.type==='pdf'){try{const r=await fetch(a.url,{method:'HEAD',signal:AbortSignal.timeout(10000)});console.log(p.status,r.status,r.headers.get('content-type'),p.title)}catch(e){console.log('FETCH FAILED',p.title,e.message)}}}finally{await c.close()}
try{const r=await fetch('http://localhost:8787/api/public/notes',{headers:{Origin:'http://127.0.0.1:5174'},signal:AbortSignal.timeout(5000)});console.log('API',r.status,await r.text())}catch(e){console.log('API unavailable',e.message)}
