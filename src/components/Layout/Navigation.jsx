import { useEffect, useRef } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { profile } from '../../data/profile';

export default function Navigation({isDark,toggleTheme,isMenuOpen,setIsMenuOpen,activeSection,scrollToSection,navItems}) {
 const header=useRef(null),toggle=useRef(null),menu=useRef(null);
 useEffect(()=>{
  if(!isMenuOpen)return;
  menu.current?.querySelector('a')?.focus();
  const dismiss=event=>{if(!header.current?.contains(event.target))setIsMenuOpen(false)};
  const escape=event=>{if(event.key==='Escape'){setIsMenuOpen(false);toggle.current?.focus()}};
  const desktop=matchMedia('(min-width: 901px)');
  const resize=()=>{if(desktop.matches)setIsMenuOpen(false)};
  document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);desktop.addEventListener('change',resize);
  return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape);desktop.removeEventListener('change',resize)};
 },[isMenuOpen,setIsMenuOpen]);
 const navigate=(event,id)=>{event.preventDefault();scrollToSection(id)};
 return <header className="site-header" ref={header} onBlur={event=>{if(isMenuOpen&&!event.currentTarget.contains(event.relatedTarget))setIsMenuOpen(false)}}>
  <nav className="nav-shell" aria-label="Main navigation"><a className="brand" href="#home" onClick={event=>navigate(event,'home')} aria-label={`${profile.name}, back to home`}><span className="brand-mark">{profile.initials}<span>.</span></span><span>{profile.name}</span></a>
   <div className="desktop-nav">{navItems.map(item=><a key={item.id} href={`#${item.id}`} onClick={event=>navigate(event,item.id)} className={activeSection===item.id?'active':''} aria-current={activeSection===item.id?'location':undefined}>{item.label}</a>)}</div>
   <div className="nav-actions"><button type="button" className="icon-button theme-button" onClick={toggleTheme} aria-label={`Switch to ${isDark?'light':'dark'} mode`}>{isDark?<Sun size={18} aria-hidden="true"/>:<Moon size={18} aria-hidden="true"/>}</button><button type="button" ref={toggle} className="icon-button menu-button" onClick={()=>setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen?'Close menu':'Open menu'} aria-controls="portfolio-mobile-nav" aria-expanded={isMenuOpen}>{isMenuOpen?<X size={20} aria-hidden="true"/>:<Menu size={20} aria-hidden="true"/>}</button></div>
  </nav>
  {isMenuOpen&&<nav className="mobile-nav" id="portfolio-mobile-nav" ref={menu} aria-label="Mobile navigation">{navItems.map(item=><a key={item.id} href={`#${item.id}`} onClick={event=>navigate(event,item.id)} aria-current={activeSection===item.id?'location':undefined}>{item.label}</a>)}</nav>}
  <div className="scroll-progress" aria-hidden="true"><span/></div>
 </header>;
}
