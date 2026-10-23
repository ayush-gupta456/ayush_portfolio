import { API_BASE } from '../../shared/browser-config.js';
export const publicUrl = import.meta.env.VITE_PUBLIC_URL || (import.meta.env.DEV?'http://localhost:5174':'https://ayushgupta-portfolio.vercel.app');

export async function request(path,{csrf,responseType,...options}={}) {
 try {
  if(typeof options.body==='string'&&new TextEncoder().encode(options.body).byteLength>64*1024){const error=Error('This entry exceeds the 64 KB text limit. Shorten the content or references before saving.');error.status=413;throw error}
  const timeout=AbortSignal.timeout(options.body instanceof File?90000:60000);
  const response=await fetch(`${API_BASE}${path}`,{credentials:'include',...options,signal:options.signal?AbortSignal.any([options.signal,timeout]):timeout,headers:{...(typeof options.body==='string'?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...options.headers}});
  if(response.ok&&responseType==='blob')return response.blob();
  const data=await response.json().catch(()=>null);
  if(response.status===401&&!['/admin/auth/login','/admin/auth/session'].includes(path))window.dispatchEvent(new Event('admin-session-expired'));
  if(!response.ok){const error=Error(data?.error||`The request could not be completed (${response.status}).`);error.status=response.status;error.code=data?.code;error.details=Array.isArray(data?.details)?data.details:[];throw error}
  if(!data)throw Error('The server returned an unexpected response. Reload the list before saving again.');
  return data;
 }catch(error){
  if(error.name==='TimeoutError')throw Error('The request timed out. It may have completed. Refresh the saved entry before trying again.');
  if(error instanceof TypeError)throw Error('Cannot connect to the API. Your unsaved changes are still here.');
  throw error;
 }
}

export async function downloadPending(id,name) {
 const blob=await request(`/admin/notes/uploads/${encodeURIComponent(id)}`,{responseType:'blob'});
 const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
