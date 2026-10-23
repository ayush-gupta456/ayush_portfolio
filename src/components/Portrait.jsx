import { useState } from 'react';
import { profile } from '../data/profile';

export default function Portrait({alt='',priority=false}) {
 const [failed,setFailed]=useState(null);
 if(!profile.portraitUrl||failed===profile.portraitUrl)return <span className="portrait-placeholder" role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={alt?undefined:true}>{profile.initials}</span>;
 return <img src={profile.portraitUrl} alt={alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>setFailed(profile.portraitUrl)}/>;
}
