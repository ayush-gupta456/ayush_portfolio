import test from 'node:test';
import assert from 'node:assert/strict';
import {originGuard,originMatches,csrfGuard} from '../src/origin.js';
import {registerNotes} from '../src/notes.js';
import {validateAdminFile} from '../../admin/src/media.js';

const response=()=>({statusCode:200,status(value){this.statusCode=value;return this},json(data){this.data=data;return this}});
function runGuard(guard,{origin,site,method='GET',token,session}={}){let passed=false;const res=response();guard({method,session,get:name=>({'origin':origin,'sec-fetch-site':site,'x-csrf-token':token}[name])},res,()=>passed=true);return {passed,res}}
test('production origin comparison stays exact; localhost aliases only work in development',()=>{
 assert.equal(originMatches('http://127.0.0.1:4176','http://localhost:4176'),true);
 assert.equal(originMatches('http://127.0.0.1:4176','http://localhost:4176',true),false);
 assert.equal(originMatches('https://admin.example.com.evil.test','https://admin.example.com',true),false);
 assert.equal(originMatches('null','https://admin.example.com',true),false);
});
test('private same-origin GET can omit Origin, while cross-site reads and mutations cannot',()=>{
 const guard=originGuard('https://admin.example.com',{isProduction:true,allowSameOriginReads:true});
 assert.equal(runGuard(guard,{site:'same-origin'}).passed,true);
 assert.equal(runGuard(guard,{site:'cross-site'}).res.statusCode,403);
 assert.equal(runGuard(guard,{}).res.statusCode,403);
 assert.equal(runGuard(guard,{site:'same-origin',method:'POST'}).res.statusCode,403);
 assert.equal(runGuard(guard,{site:'same-origin',origin:'https://evil.example.com'}).res.statusCode,403);
 assert.equal(runGuard(guard,{method:'POST',origin:'https://admin.example.com'}).passed,true);
});
test('mutations require a session-bound CSRF token',()=>{
 const guard=csrfGuard((a,b)=>a===b);
 assert.equal(runGuard(guard,{token:'valid',session:{csrfToken:'valid'}}).passed,true);
 for(const data of [{},{token:'invalid',session:{csrfToken:'valid'}},{session:{csrfToken:'valid'}},{token:'valid'}]){
  const {res,passed}=runGuard(guard,data);assert.equal(passed,false);assert.equal(res.statusCode,403);assert.equal(res.data.code,'CSRF_INVALID');
 }
});
test('saved notes return the authoritative version and attachment list',async()=>{
 const routes={};let saved;const noop=(_req,_res,next)=>next();
 registerNotes({get:()=>{},post:(path,...handlers)=>routes[path]=handlers},{col:()=>({updateOne:async(filter,update)=>{saved=update;return {upsertedCount:1}}}),adminGuard:[noop],mutateGuard:[noop],requireOrigin:()=>noop,publicOrigin:'https://example.com',persistentRateLimit:()=>noop});
 const res=response();await routes['/api/admin/notes'].at(-1)({body:{title:'New admin note',author:'Editor',category:'Web',summary:'An explanation of a practical web development topic.',body:'a'.repeat(110),status:'draft',notify:false,attachments:[{name:'Reference',type:'link',url:'https://example.com/docs'}]}},res,error=>{throw error});
 assert.equal(res.statusCode,200);assert.equal(res.data.version,1);assert.deepEqual(res.data.attachments,saved.$set.attachments);assert.ok(res.data.updatedAt instanceof Date);assert.ok(saved.$setOnInsert.createdAt instanceof Date);
});
test('admin file checks reject spoofed, empty, mismatched and wrong-placement files',async()=>{
 await assert.rejects(()=>validateAdminFile(new File(['<html>bad</html>'],'guide.pdf',{type:'application/pdf'})),/matching file/);
 await assert.rejects(()=>validateAdminFile(new File([],'guide.pdf')),/non-empty/);
 await assert.rejects(()=>validateAdminFile(new File(['%PDF-1.7 content'],'avatar.png')),/matching file/);
 await assert.rejects(()=>validateAdminFile(new File(['%PDF-1.7 content'],'guide.pdf'),{kind:'image'}),/needs an image/);
 assert.equal(await validateAdminFile(new File(['%PDF-1.7 content'],'guide.pdf'),{kind:'pdf'}),'pdf');
 assert.equal(await validateAdminFile(new File([new Uint8Array([137,80,78,71,13,10,26,10])],'avatar.png'),{kind:'image'}),'png');
});
