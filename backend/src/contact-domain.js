import { resolve4, resolve6, resolveMx } from 'node:dns/promises';

export function createMailDomainCheck({mx=resolveMx,ipv4=resolve4,ipv6=resolve6,timeoutMs=5000}={}) {
  const cache = new Map();
  async function lookup(domain) {
    try {
      const records=await mx(domain);
      // RFC 7505 null MX explicitly means this domain does not receive mail.
      if(records.length)return records.some(record=>record.exchange&&record.exchange!=='.');
    } catch(error) { if(error.code==='ENOTFOUND')return false;if(error.code!=='ENODATA')throw error; }
    const records=await Promise.allSettled([Promise.resolve().then(()=>ipv4(domain)),Promise.resolve().then(()=>ipv6(domain))]);
    if(records.some(result=>result.status==='fulfilled'&&result.value.length))return true;
    const temporary=records.find(result=>result.status==='rejected'&&!['ENODATA','ENOTFOUND'].includes(result.reason.code));
    if(temporary)throw temporary.reason;
    return false;
  }
  return async email=>{
    const domain=email.slice(email.lastIndexOf('@')+1).toLowerCase();
    const cached=cache.get(domain);if(cached&&cached.expiresAt>Date.now())return cached.value;
    let timer;
    try {
      const value=await Promise.race([lookup(domain),new Promise((_,reject)=>{timer=setTimeout(()=>{const error=Error('Email domain lookup timed out');error.code='ETIMEOUT';reject(error)},timeoutMs)})]);
      if(cache.size>=2000)cache.clear();cache.set(domain,{value,expiresAt:Date.now()+600000});return value;
    } finally { clearTimeout(timer); }
  };
}
