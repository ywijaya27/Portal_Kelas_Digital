import {Demo} from './demo.js';
export const isDemo=!window.GAS_URL;
let token='',identity='guest',epoch=0;const pending=new Map(),memory=new Map();
const READ=new Set(['public.boot','member.boot','course.read','course.public','admin.boot','admin.reports','admin.settings.read']);
export function setSession(t,user){token=t||'';identity=user?.user_id||'guest';memory.clear();pending.clear();epoch++;}
export function clearCache(){epoch++;memory.clear();}
export async function api(action,data={},options={}){
 const read=READ.has(action),key=identity+'|'+epoch+'|'+action+'|'+JSON.stringify(data);
 if(!read){clearCache();}else if(!options.fresh&&memory.has(key)&&Date.now()-memory.get(key).at<30000)return structuredClone(memory.get(key).value);
 if(read&&pending.has(key))return pending.get(key);
 const request=(async()=>{
 if(isDemo){const value=await Demo.call(action,data);if(read)memory.set(key,{at:Date.now(),value});return value;}
 const endpoint=String(window.GAS_URL);if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint))throw Error('URL backend GAS tidak valid.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000),start=performance.now();
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},redirect:'follow',body:JSON.stringify({action,data,token}),signal:controller.signal,credentials:'omit'});const result=await response.json();if(!result.success){if(result.code==='AUTH')window.dispatchEvent(new Event('session-expired'));throw Error(result.message||'Permintaan gagal.');}try{performance.measure?.('api:'+action,{start,end:performance.now()});}catch{}if(read)memory.set(key,{at:Date.now(),value:result.data});return result.data;
 }catch(error){if(error.name==='AbortError')throw Error(read?'Server belum merespons. Coba lagi.':'Respons belum diterima. Periksa status sebelum mengulangi transaksi.');throw error;}finally{clearTimeout(timeout);}
 })();if(read){pending.set(key,request);request.finally(()=>pending.delete(key)).catch(()=>{});}return request;
}
export async function publicBoot(){if(isDemo)return Demo.call('public.boot');const r=await fetch(window.GAS_URL+'?action=public.boot',{credentials:'omit'});const data=await r.json();if(!data.success)throw Error(data.message);return data.data;}
export function demoRole(role){Demo.role(role);clearCache();}
export {Demo};
