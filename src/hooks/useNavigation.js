import { useState, useEffect } from 'react';

const navItems=[{id:'about',label:'About'},{id:'skills',label:'Stack'},{id:'projects',label:'Work'},{id:'current-project',label:'Now'},{id:'experience',label:'Journey'},{id:'resume',label:'Resume'},{id:'notes',label:'Notebook'},{id:'contact',label:'Contact'}];
const sectionIds=['home','about','skills','projects','current-project','experience','resume','certificates','notes','contact'];
export const useNavigation=()=>{
 const [isMenuOpen,setIsMenuOpen]=useState(false),[activeSection,setActiveSection]=useState('home');
 const scrollToSection=id=>{
  const element=document.getElementById(id);setIsMenuOpen(false);
  if(!element)return;
  const headerHeight=document.querySelector('.site-header')?.getBoundingClientRect().height||80;
  const target=Math.max(0,element.getBoundingClientRect().top+scrollY-Math.min(headerHeight,90)-16);
  element.tabIndex=-1;element.focus({preventScroll:true});
  window.scrollTo({top:target,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  history.replaceState(null,'',`#${id}`);
 };
 useEffect(()=>{
  let frame=0;
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{let current='home';for(const id of sectionIds){const element=document.getElementById(id);if(element&&element.getBoundingClientRect().top<=110)current=id}setActiveSection(current)})};
  update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
  return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);cancelAnimationFrame(frame)};
 },[]);
 return {isMenuOpen,setIsMenuOpen,activeSection,navItems,scrollToSection};
};
