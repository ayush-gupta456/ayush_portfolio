import {useLayoutEffect,useState} from 'react';
import {Sun,Moon} from 'lucide-react';
export default function ThemeToggle(){
 const[theme,setTheme]=useState(()=>{try{const stored=localStorage.getItem('admin-theme');return ['light','dark'].includes(stored)?stored:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}catch{return 'dark'}});
 useLayoutEffect(()=>{document.documentElement.dataset.adminTheme=theme;document.documentElement.style.colorScheme=theme;try{localStorage.setItem('admin-theme',theme)}catch{/* Preference remains available for this visit. */}},[theme]);
 return <button type="button" className="admin-theme-control" aria-label={`Switch to ${theme==='dark'?'light':'dark'} theme`} onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}<span>{theme==='dark'?'Light mode':'Dark mode'}</span></button>
}
