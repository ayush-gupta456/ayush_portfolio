export function originMatches(actual,expected,isProduction=false) {
 if(actual===expected&&actual)return true;
 if(isProduction||!actual||!expected)return false;
 try{const a=new URL(actual),b=new URL(expected),local=new Set(['localhost','127.0.0.1','[::1]']);return a.origin===actual&&local.has(a.hostname)&&local.has(b.hostname)&&a.protocol===b.protocol&&a.port===b.port}catch{return false}
}
export function originGuard(expected,{isProduction=false,allowSameOriginReads=false}={}) {
 return (req,res,next)=>{
  const origin=req.get('origin');
  if(originMatches(origin,expected,isProduction))return next();
  // Same-origin GET fetches omit Origin. Fetch Metadata cannot be set by page scripts.
  if(!origin&&allowSameOriginReads&&['GET','HEAD'].includes(req.method)&&req.get('sec-fetch-site')==='same-origin')return next();
  return res.status(403).json({error:'Request origin not allowed.'});
 };
}
export function csrfGuard(compare) {
 return (req,res,next)=>{
  const token=req.get('x-csrf-token');
  if(!token||!req.session?.csrfToken||!compare(token,req.session.csrfToken))return res.status(403).json({code:'CSRF_INVALID',error:'Security token expired. Reload the workspace before trying again.'});
  return next();
 };
}
