import test from 'node:test';
import assert from 'node:assert/strict';
import {registerNotes,validateResourcePost} from '../src/notes.js';
function setup(){const routes={};let query;const app={get:(path,...handlers)=>routes[path]=handlers,post:(path,...handlers)=>routes[`POST ${path}`]=handlers};const noop=(_req,_res,next)=>next();registerNotes(app,{col:()=>({insertOne:async()=>({insertedId:'test'}),find:(_q,options)=>{query=options;return {sort(){return this},limit(){return this},toArray:async()=>[]}}}),adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});return {routes,query:()=>query};}
function response(){return {statusCode:200,status(code){this.statusCode=code;return this},json(data){this.data=data;return this}}}
test('public listing uses an allowlist excluding private review fields',async()=>{const api=setup();const res=response();await api.routes['/api/public/notes'].at(-1)({},res,e=>{throw e});const fields=api.query().projection;assert.equal(fields.title,1);assert.equal(fields.email,undefined);assert.equal(fields.reviewNote,undefined);assert.equal(fields.pendingUploads,undefined)});
test('visitor references reject executable URL protocols',async()=>{const api=setup();const res=response();await api.routes['POST /api/public/notes'].at(-1)({body:{title:'Useful note',author:'Reader',category:'Web',summary:'A useful explanation for readers.',body:'a'.repeat(110),email:'reader@example.com',consent:true,links:['javascript:alert(1)']}},res,e=>{throw e});assert.equal(res.statusCode,400)});
test('invalid subscription token is rejected before database access',async()=>{const api=setup();const res=response();await api.routes['POST /api/public/subscription'].at(-1)({body:{action:'confirm',token:{$ne:null}}},res,e=>{throw e});assert.equal(res.statusCode,400)});

test('resource posts accept optional URLs but validate supplied provider URLs',()=>{
 const base={category:'Posts',body:'A useful developer resource.',resourceType:'video',resourceUrl:''};
 assert.equal(validateResourcePost(base),null);
 assert.equal(validateResourcePost({...base,resourceUrl:'https://youtu.be/example'}),null);
 assert.ok(validateResourcePost({...base,resourceUrl:'https://youtube.com.evil.example/video'}));
 assert.ok(validateResourcePost({...base,resourceUrl:'javascript:alert(1)'}));
 assert.ok(validateResourcePost({...base,resourceUrl:'https://user:password@youtube.com/watch'}));
 assert.ok(validateResourcePost({...base,category:'Web',body:'Too short'}));
});
test('visitor can submit a resource post without PDF uploads or reference links',async()=>{
 const api=setup(),res=response();
 await api.routes['POST /api/public/notes'].at(-1)({body:{title:'A developer tool worth trying',author:'Reader',category:'Posts',summary:'A tool that helps explain a new workflow.',body:'A useful tool for learning the workflow.',resourceType:'app',email:'reader@example.com',consent:true}},res,e=>{throw e});
 assert.equal(res.statusCode,201);
});

test('stale admin edits are rejected before changing a note or sending email',async()=>{
 const routes={};let mutated=false;
 const app={get:()=>{},post:(path,...handlers)=>routes[path]=handlers};
 const noop=(_req,_res,next)=>next();
 registerNotes(app,{col:()=>({findOne:async()=>({version:4}),updateOne:async()=>{mutated=true}}),adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});
 const res=response();await routes['/api/admin/notes'].at(-1)({body:{id:'note-1',expectedVersion:3,title:'Existing note',author:'Editor',category:'Web',summary:'A summary that explains this useful note.',body:'a'.repeat(110),status:'published',notify:true}},res,e=>{throw e});
 assert.equal(res.statusCode,409);assert.equal(mutated,false);
});

test('rejected note deletion uses atomic status and version conditions',async()=>{
 const routes={};let filter;
 const app={get:()=>{},post:(path,...handlers)=>routes[path]=handlers};const noop=(_req,_res,next)=>next();
 registerNotes(app,{col:()=>({findOneAndDelete:async query=>{filter=query;return null;}}),adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});
 const res=response();await routes['/api/admin/notes/delete'].at(-1)({body:{id:'note-1',expectedVersion:2}},res,e=>{throw e});
 assert.equal(filter.status,'rejected');assert.equal(filter.version,2);assert.equal(res.statusCode,409);
});
test('deleting a rejected note succeeds and expires its pending uploads',async()=>{
 const routes={};let cleanup;
 const app={get:()=>{},post:(path,...handlers)=>routes[path]=handlers};const noop=(_req,_res,next)=>next();
 registerNotes(app,{col:name=>name==='notes'?{findOneAndDelete:async()=>({_id:'note-1',pendingUploads:[{id:'file-1'}]})}:{updateMany:async(query,update)=>{cleanup={query,update};}},adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});
 const res=response();await routes['/api/admin/notes/delete'].at(-1)({body:{id:'note-1',expectedVersion:2}},res,e=>{throw e});
 assert.equal(res.statusCode,200);assert.deepEqual(cleanup.query,{_id:{$in:['file-1']}});assert.ok(cleanup.update.$set.expiresAt instanceof Date);
});

for(const topic of ['', 'SAP Commerce'])test(`public submission retains optional topic: ${topic||'(empty)'}`,async()=>{
 const routes={};let saved;
 const app={get:()=>{},post:(path,...handlers)=>routes[path]=handlers};const noop=(_req,_res,next)=>next();
 registerNotes(app,{col:()=>({insertOne:async data=>{saved=data}}),adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});
 const res=response();await routes['/api/public/notes'].at(-1)({body:{title:'SAP Commerce guide',author:'Reader',category:'Engineering',topic,summary:'A practical introduction to SAP Commerce.',body:'a'.repeat(110),email:'reader@example.com',consent:true}},res,e=>{throw e});
 assert.equal(res.statusCode,201);assert.equal(saved.category,'Engineering');assert.equal(saved.topic,topic);assert.equal(saved.status,'pending');assert.deepEqual(saved.attachments,[]);
});

function subscriptionFixture({available=true,fail=false}={}){
 const routes={};let record=null,sent=null;
 const collection={findOne:async()=>record,updateOne:async(filter,update)=>{
  if(!filter._id){if(!record)return {matchedCount:0};if(filter.confirmHash && (record.confirmHash!==filter.confirmHash||record.active!==false||!(record.expiresAt>new Date())))return {matchedCount:0};if(filter.unsubscribeHash&&record.unsubscribeHash!==filter.unsubscribeHash)return {matchedCount:0};}
  record={...record,...(filter._id?{_id:filter._id}:{}),...update.$set};for(const key of Object.keys(update.$unset||{}))delete record[key];return {matchedCount:1};
 }};
 const app={get:(path,...handlers)=>routes[path]=handlers,post:(path,...handlers)=>routes[path]=handlers};const noop=(_req,_res,next)=>next();
 registerNotes(app,{col:()=>collection,adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop,newsletter:{configured:()=>available,send:async(to,subject,text)=>{if(fail)throw Error('Provider unavailable');sent={to,subject,text}}}});
 return {routes,record:()=>record,sent:()=>sent};
}
test('subscription requires confirmation and confirmation tokens cannot be reused',async()=>{
 const api=subscriptionFixture(),res=response();await api.routes['/api/public/subscribe'].at(-1)({body:{email:'Reader@Example.com',consent:true}},res,e=>{throw e});
 assert.equal(res.statusCode,200);assert.equal(api.record().active,false);assert.equal(api.sent().to,'reader@example.com');
 const token=api.sent().text.match(/confirm=([a-f0-9]{64})/)[1];assert.notEqual(api.record().confirmHash,token);
 const confirm=response();await api.routes['/api/public/subscription'].at(-1)({body:{action:'confirm',token}},confirm,e=>{throw e});assert.equal(confirm.statusCode,200);assert.equal(api.record().active,true);
 const replay=response();await api.routes['/api/public/subscription'].at(-1)({body:{action:'confirm',token}},replay,e=>{throw e});assert.equal(replay.statusCode,400);
});
test('unconfigured subscription returns unavailable without storing subscriber details',async()=>{
 const api=subscriptionFixture({available:false}),res=response();await api.routes['/api/public/subscribe'].at(-1)({body:{email:'reader@example.com',consent:true}},res,e=>{throw e});assert.equal(res.statusCode,503);assert.equal(api.record(),null);assert.equal(api.sent(),null);
});
test('confirmation delivery failures report failure instead of a success message',async()=>{
 const api=subscriptionFixture({fail:true}),res=response();await api.routes['/api/public/subscribe'].at(-1)({body:{email:'reader@example.com',consent:true}},res,e=>{throw e});assert.equal(res.statusCode,502);assert.equal(api.record().active,false);
});
test('unsubscribe deactivates confirmed subscribers',async()=>{
 const {createHash}=await import('node:crypto');const api=subscriptionFixture(),res=response();await api.routes['/api/public/subscribe'].at(-1)({body:{email:'reader@example.com',consent:true}},res,e=>{throw e});const token='f'.repeat(64);api.record().active=true;api.record().unsubscribeHash=createHash('sha256').update(token).digest('hex');const unsub=response();await api.routes['/api/public/subscription'].at(-1)({body:{action:'unsubscribe',token}},unsub,e=>{throw e});assert.equal(unsub.statusCode,200);assert.equal(api.record().active,false);
});
