import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {registerContact} from '../src/contact.js';
import {createMailDomainCheck} from '../src/contact-domain.js';
import {validateContactFields} from '../../shared/contact-rules.js';

const body=()=>({submissionId:randomUUID(),name:'A reader',email:'reader@example.com',subject:'A useful discussion',message:'I would like to discuss a project.',website:''});
const response=()=>({statusCode:200,headers:{},setHeader(key,value){this.headers[key]=value},status(value){this.statusCode=value;return this},json(data){this.data=data;return this}});
function fixture({validDomain=true,delivery={mainSent:true,autoReplySent:true},send}={}) {
 const records=new Map(),contacts=[],sent=[];let route;
 const col=name=>name==='contact_messages'?{insertOne:async data=>contacts.push(data)}:{
  insertOne:async doc=>{if(records.has(doc._id)){const error=Error('duplicate');error.code=11000;throw error}records.set(doc._id,doc)},
  findOne:async query=>records.get(query._id),
  updateOne:async(query,update)=>Object.assign(records.get(query._id),update.$set),
  deleteOne:async query=>records.delete(query._id),
  findOneAndUpdate:async(query,pipeline)=>{const current=records.get(query._id)||{_id:query._id};const cutoff=pipeline[0].$set.recentContactSubmissions.$filter.cond.$gt[1];const recent=(current.recentContactSubmissions||[]).filter(date=>date>cutoff);current.contactLimitReached=recent.length>=2;if(recent.length<2)recent.push(pipeline[1].$set.recentContactSubmissions.$cond[1].$concatArrays[1][0]);current.recentContactSubmissions=recent;records.set(query._id,current);return {...current}}
 };
 registerContact({post:(_path,...handlers)=>route=handlers.at(-1)},{col,guards:[],domainAcceptsMail:async()=>validDomain,sendContactEmails:async data=>{sent.push(data);return send?send(data):delivery},emailJsConfigured:true});
 return {records,contacts,sent,submit:async data=>{const res=response();await route({body:data},res,error=>{throw error});return res}};
}

test('contact checks required trimmed fields and single-line headers',()=>{
 assert.deepEqual(validateContactFields(body()),{});
 assert.ok(validateContactFields({...body(),name:'   ',subject:'hello\nBcc: other@example.com'}).subject);
});
test('same normalized email can submit twice in 24 hours; different emails have separate limits',async()=>{
 const api=fixture();assert.equal((await api.submit(body())).statusCode,201);
 assert.equal((await api.submit({...body(),email:'READER@example.com'})).statusCode,201);
 const blocked=await api.submit(body());assert.equal(blocked.statusCode,429);assert.equal(blocked.data.code,'CONTACT_DAILY_LIMIT');assert.match(blocked.data.error,/6:00 PM IST/);assert.ok(Number(blocked.headers['Retry-After'])>0);
 assert.equal((await api.submit({...body(),email:'different@example.com'})).statusCode,201);
 assert.equal(api.sent.length,3);assert.equal(api.contacts.length,3);
});
test('concurrent requests cannot exceed the per-email limit',async()=>{
 const api=fixture();const results=await Promise.all([api.submit(body()),api.submit(body()),api.submit(body())]);
 assert.deepEqual(results.map(result=>result.statusCode).sort(),[201,201,429]);assert.equal(api.sent.length,2);
});
test('a receipt replay does not send emails again or consume another quota slot',async()=>{
 const api=fixture(),data=body();await api.submit(data);const retry=await api.submit(data);
 assert.equal(retry.statusCode,201);assert.equal(api.sent.length,1);assert.equal(api.contacts.length,1);
 assert.equal((await api.submit(body())).statusCode,201);
 assert.equal((await api.submit({...data,message:'Changed content'})).statusCode,409);
 for(const record of api.records.values()){assert.equal(record.message,undefined);assert.equal(record.subject,undefined);assert.equal(record.email,undefined)}
 assert.deepEqual(Object.keys(api.contacts[0]).sort(),['email','name']);
});
test('in-flight duplicate returns processing instead of sending a second time',async()=>{
 let release;const gate=new Promise(resolve=>release=resolve);
 const api=fixture({send:async()=>{await gate;return {mainSent:true,autoReplySent:true}}}),data=body();const original=api.submit(data);
 while(!api.sent.length)await new Promise(resolve=>setImmediate(resolve));
 const duplicate=await api.submit(data);assert.equal(duplicate.statusCode,202);assert.equal(duplicate.data.code,'CONTACT_PROCESSING');release();await original;assert.equal(api.sent.length,1);
});
test('invalid domains, malformed fields and honeypot do not send emails',async()=>{
 const api=fixture({validDomain:false});assert.equal((await api.submit(body())).data.code,'INVALID_EMAIL_DOMAIN');assert.equal((await api.submit({...body(),name:' '})).statusCode,400);assert.equal((await api.submit({...body(),website:'spam'})).statusCode,202);assert.equal(api.sent.length,0);assert.equal(api.contacts.length,0);
});
test('partial email failures remain explicit and are not retried on receipt replay',async()=>{
 const api=fixture({delivery:{mainSent:true,autoReplySent:false}}),data=body();const result=await api.submit(data);
 assert.equal(result.data.emailSent,false);assert.equal(result.data.emailDelivery.ownerNotification,true);assert.equal(result.data.emailDelivery.senderConfirmation,false);await api.submit(data);assert.equal(api.sent.length,1);
});
test('email domains explicitly declaring null MX are rejected without A fallback',async()=>{
 let fallback=0;const check=createMailDomainCheck({mx:async()=>[{exchange:'.',priority:0}],ipv4:async()=>{fallback++;return ['127.0.0.1']}});
 assert.equal(await check('user@example.com'),false);assert.equal(fallback,0);
});
test('mail domain checks support IPv6 fallback and cache successful checks',async()=>{
 let calls=0;const missing=()=>{const error=Error('no records');error.code='ENODATA';throw error};
 const check=createMailDomainCheck({mx:async()=>{calls++;return missing()},ipv4:missing,ipv6:async()=>['2001:db8::1']});
 assert.equal(await check('a@example.com'),true);assert.equal(await check('b@example.com'),true);assert.equal(calls,1);
});
test('mail domain checks time out rather than hanging the contact form',async()=>{
 const check=createMailDomainCheck({mx:()=>new Promise(()=>{}),timeoutMs:10});await assert.rejects(()=>check('a@example.com'),{code:'ETIMEOUT'});
});
