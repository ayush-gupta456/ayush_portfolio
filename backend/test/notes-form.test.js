import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {registerNotes} from '../src/notes.js';
import {isSafeReference,validateNoteFields} from '../../shared/note-rules.js';

const base = () => ({submissionId:randomUUID(),author:'A reader',email:'reader@example.com',title:'A practical developer note',category:'Web',topic:'',summary:'A useful practical explanation for developers.',body:'A'.repeat(110),links:[],uploads:[],consent:true});
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this},json(data){this.data=data;return this}});
function fixture({failInsert=false}={}) {
 const notes=new Map(),uploads=new Map(),routes={};
 const noop=(_req,_res,next)=>next();
 const collections={
  notes:{findOne:async query=>notes.get(query._id),insertOne:async doc=>{if(failInsert)throw Error('Storage unavailable');if(notes.has(doc._id)){const error=Error('duplicate');error.code=11000;throw error}notes.set(doc._id,doc)}},
  note_uploads:{findOneAndUpdate:async (query,update)=>{const doc=uploads.get(query._id);if(!doc||doc.keyHash!==query.keyHash||!(doc.expiresAt>query.expiresAt.$gt)||doc.claimedBy)return null;const before={...doc};Object.assign(doc,update.$set);for(const field of Object.keys(update.$unset||{}))delete doc[field];return before},updateOne:async(query,update)=>{const doc=uploads.get(query._id);if(doc?.claimedBy!==query.claimedBy)return;Object.assign(doc,update.$set);for(const field of Object.keys(update.$unset||{}))delete doc[field]}}
 };
 registerNotes({get:()=>{},post:(path,...handlers)=>routes[path]=handlers},{col:name=>collections[name],adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});
 return {notes,uploads,submit:async body=>{const res=response();await routes['/api/public/notes'].at(-1)({body},res,error=>{throw error});return res}};
}
function attachment(api) {
 const id=randomUUID(),key='a'.repeat(64);
 api.uploads.set(id,{_id:id,keyHash:createHash('sha256').update(key).digest('hex'),expiresAt:new Date(Date.now()+60000),type:'application/pdf'});
 return {id,key,name:'guide.pdf'};
}

test('client validation catches whitespace, missing consent and provider mismatch before uploads',()=>{
 const errors=validateNoteFields({...base(),author:'  ',category:'Posts',resourceType:'repository',resourceUrl:'https://youtube.com/watch',consent:false});
 assert.ok(errors.author);assert.ok(errors.consent);assert.ok(errors.resourceUrl);
 assert.deepEqual(validateNoteFields(base()),{});
});
test('reference links reject embedded credentials and unsafe protocols',()=>{
 for(const value of ['javascript:alert(1)','http://example.com','https://user:password@example.com','not a url'])assert.equal(isSafeReference(value),false);
 assert.equal(isSafeReference('https://example.com/docs'),true);
});
test('identical submission retries create one note and immutable creation time',async()=>{
 const api=fixture(),body=base();assert.equal((await api.submit(body)).statusCode,201);
 const created=api.notes.get(body.submissionId).createdAt;
 assert.equal((await api.submit(body)).statusCode,201);assert.equal(api.notes.size,1);assert.equal(api.notes.get(body.submissionId).createdAt,created);
 assert.equal((await api.submit({...body,title:'A changed title for the same receipt'})).statusCode,409);
});
test('only one submission can consume an upload, including concurrent requests',async()=>{
 const api=fixture(),file=attachment(api),first={...base(),uploads:[file]},second={...base(),uploads:[file]};
 const results=await Promise.all([api.submit(first),api.submit(second)]);
 assert.deepEqual(results.map(result=>result.statusCode).sort(),[201,400]);assert.equal(api.notes.size,1);
 assert.equal(api.uploads.get(file.id).keyHash,undefined);
 assert.equal(api.uploads.get(file.id).expiresAt,undefined);
});
test('failed storage releases upload claims for retry',async()=>{
 const api=fixture({failInsert:true}),file=attachment(api);
 await assert.rejects(()=>api.submit({...base(),uploads:[file]}),/Storage unavailable/);
 assert.equal(api.uploads.get(file.id).claimedBy,undefined);assert.ok(api.uploads.get(file.id).keyHash);assert.ok(api.uploads.get(file.id).expiresAt instanceof Date);
});
test('duplicate upload IDs and credential URLs are rejected without saving',async()=>{
 const api=fixture(),file=attachment(api);
 assert.equal((await api.submit({...base(),uploads:[file,file]})).statusCode,400);
 assert.equal((await api.submit({...base(),links:['https://user:pass@example.com']})).statusCode,400);
 assert.equal(api.notes.size,0);
});
test('visitors cannot supply public cover images or publication status',async()=>{
 const api=fixture(),body={...base(),coverUrl:'https://example.com/track.png',status:'published'};
 assert.equal((await api.submit(body)).statusCode,201);
 const saved=api.notes.get(body.submissionId);assert.equal(saved.status,'pending');assert.equal(saved.coverUrl,undefined);
});
