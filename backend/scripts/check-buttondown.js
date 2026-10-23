import {config} from 'dotenv';config({path:new URL('../.env',import.meta.url),quiet:true});
const r=await fetch('https://api.buttondown.com/v1/emails',{headers:{Authorization:`Token ${process.env.BUTTONDOWN_API_KEY}`},signal:AbortSignal.timeout(15000)});console.log('Buttondown read-only API check:',r.status);if(!r.ok)process.exitCode=1;
