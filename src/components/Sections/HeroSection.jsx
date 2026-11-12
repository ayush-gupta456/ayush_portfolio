import { motion as Motion, useReducedMotion } from "framer-motion";
import Portrait from '../Portrait.jsx';
import { ArrowDownRight, ArrowUpRight, Code2, Github, Linkedin, Mail, Trophy } from "lucide-react";
import { profile } from "../../data/profile";

const codingIcons = { LeetCode: Code2, Codeforces: Trophy };

const HeroSection = ({ scrollToSection }) => {
  const reduce = useReducedMotion();
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
  return (
  <section id="home" className="hero-section page-wrap hero-refined">
    <Motion.div className="hero-copy" initial={reduce ? false : "hidden"} animate="visible" variants={{ visible: { transition: { staggerChildren: .075 } } }}>
      <div className="eyebrow"><span className="status-dot" /> Open to opportunities <span className="eyebrow-divider">/</span> Lucknow, India</div>
      <Motion.p className="hero-kicker" variants={item}>FULL-STACK DEVELOPER / {profile.name}</Motion.p>
      <Motion.h1 variants={item}>Thoughtful code.<br /><span>Real-world impact.</span></Motion.h1>
      <Motion.p variants={item} className="hero-lede">From expressive interfaces to dependable Java backends. I build useful software with care for every detail.</Motion.p>
      <Motion.div variants={item} className="hero-specialties" aria-label="Areas of focus"><span>Java & Spring</span><span>SAP Commerce</span><span>AI-powered products</span></Motion.div>
      <Motion.div variants={item} className="hero-actions">
        <button className="button button-primary" onClick={() => scrollToSection("projects")}>Explore my work <ArrowDownRight size={17} /></button>
        <button className="button button-quiet" onClick={() => scrollToSection("contact")}>Let’s talk <ArrowUpRight size={16} /></button>
      </Motion.div>
      <div className="hero-links" aria-label="Social links">
        <a href={profile.links.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
        <a href={profile.links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>
        <a href={`mailto:${profile.email}`}><Mail size={16} /> Email</a>
      </div>
      <div className="hero-coding-block">
        <span className="hero-coding-heading">CODING PROFILES</span>
        <div className="hero-coding-profiles">
          {profile.codingProfiles.map((codingProfile, index) => {
            const Icon = codingIcons[codingProfile.platform] ?? Code2;
            return (
              <a
                className="hero-coding-card"
                data-glass
                style={{ "--profile-index": index }}
                href={codingProfile.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${codingProfile.platform}: ${codingProfile.solved}, ${codingProfile.highlight}`}
                key={codingProfile.platform}
              >
                <span className="hero-coding-icon"><Icon size={16} aria-hidden="true" /></span>
                <span className="hero-coding-copy">
                  <strong>{codingProfile.platform}</strong>
                  <span>{codingProfile.solved}<i aria-hidden="true"> · </i>{codingProfile.highlight}</span>
                </span>
                <ArrowUpRight className="hero-coding-arrow" size={14} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>
    </Motion.div>
    <Motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }} className="hero-visual" aria-label="Portrait of Ayush Gupta">
      <div className="hero-glow" /><div className="hero-orbit" aria-hidden="true" />
      <div className="portrait-frame portrait-frame-animated"><Portrait alt={profile.name} priority/></div>
      <div className="floating-note note-top"><span className="note-kicker">CURRENTLY BUILDING</span><strong>{profile.currentProject.title}</strong></div>
      <div className="floating-note note-bottom"><span className="note-kicker">EDUCATION</span><strong>B.Tech · Computer Science</strong><span>GLA University · 2026</span></div>
      <div className="hero-index">CURIOUS MIND <span>·</span> HANDS-ON BUILDER</div>
    </Motion.div>
    <div className="hero-bottom"><span>Scroll to explore</span><span className="scroll-line" /></div>
  </section>
  );
};

export default HeroSection;
