import { useEffect } from "react";
import { motion as Motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Code2, ExternalLink, FileCode2, Github, Headphones, LockKeyhole, Music2, Play, Sparkles } from "lucide-react";
import { profile } from "../../data/profile";

const wave = [18, 30, 46, 24, 60, 38, 70, 48, 28, 56, 76, 44, 64, 32, 54, 72, 40, 58, 26, 44, 62, 36, 50, 22];

function StudioPreview() {
  return <div className="project-preview raaga-preview" aria-hidden="true">
    <div className="studio-window">
      <div className="preview-toolbar"><span className="preview-brand"><Music2 size={15} /> raaga<span className="preview-brand-dot">.</span></span><span>YOUR WORDS. YOUR SOUND.</span><span className="preview-avatar">A</span></div>
      <div className="studio-workspace">
        <div className="studio-editor"><span className="preview-overline">01 / THE WORDS</span><h4>A little idea.<br />A whole new sound.</h4><div className="lyric-lines"><span>[ Verse ]</span><p>Let the quiet find a melody,<br />Let a little light come through.</p><span className="lyric-caret" /></div><div className="studio-pills"><span>Dream pop</span><span>Warm vocals</span></div></div>
        <div className="studio-player"><Motion.div className="record-disc" variants={{ rest: { rotate: -12 }, hover: { rotate: 18 } }} transition={{ duration: .8 }}><div><Music2 size={25} /></div></Motion.div><span className="preview-overline">THE LISTENING ROOM</span><strong>Your next favorite song.</strong><div className="studio-wave">{wave.map((height, i) => <i key={i} style={{ height: height / 2 }} />)}</div><div className="studio-play"><Play size={12} fill="currentColor" /><span>Made from your words</span><Headphones size={13} /></div></div>
      </div>
      <div className="preview-caption"><span className="preview-status-dot" /> Lyrics → sound → your song <span>INTERFACE STUDY</span></div>
    </div>
  </div>;
}

function CodePreview() {
  return <div className="project-preview insight-preview" aria-hidden="true">
    <div className="review-window">
      <div className="preview-toolbar"><span className="preview-brand"><Code2 size={17} /> InsightCode</span><span>REVIEW WORKSPACE</span><Github size={14} /></div>
      <div className="review-tabs"><span><FileCode2 size={12} /> checkout.ts</span><span>Source & evidence</span></div>
      <div className="review-workspace"><div className="review-code"><div><i>01</i><span className="code-purple">async function</span> checkout() {'{'}</div><div><i>02</i>  <span className="code-purple">const</span> cart = <span className="code-blue">getCart</span>();</div><div className="code-highlight"><i>03</i>  <span className="code-purple">await</span> <span className="code-blue">saveOrder</span>(cart);</div><div><i>04</i>  <span className="code-purple">return</span> receipt;</div><div><i>05</i>{'}'}</div><div className="code-line-fade" /><div className="code-line-fade short" /></div><div className="review-finding"><span className="finding-label"><span /> REVIEW FINDING</span><strong>Handle the failure path</strong><p>Keep the order state consistent if the request fails.</p><div className="finding-location">checkout.ts · line 3</div><span className="preview-patch"><Check size={12} /> Preview a patch</span></div></div>
      <div className="preview-caption"><span><Sparkles size={11} /> Evidence before edits</span><span>INTERFACE STUDY</span></div>
    </div>
  </div>;
}

function ProjectPreview({ project }) {
  if (project.imageUrl) return <div className="project-preview uploaded-preview"><img src={project.imageUrl} alt={`${project.title} preview`} loading="lazy" /></div>;
  if (project.visual === "raaga") return <StudioPreview />;
  if (project.visual === "insight") return <CodePreview />;
  if (project.visual !== "password") return <div className="project-preview generic-preview" aria-hidden="true"><Code2 size={36} /><strong>{project.title}</strong><span>{project.type}</span></div>;
  return <div className="project-preview password-preview" aria-hidden="true"><div className="password-card"><div className="password-heading"><span className="password-mark"><LockKeyhole size={15} /></span><span>PassOp</span><i /></div><div className="password-search" />{["Google", "LinkedIn"].map(name => <div className="password-row" key={name}><span className="password-app">{name[0]}</span><div><b>{name}</b><small>••••••••••</small></div><span className="password-copy" /></div>)}<div className="password-add">+ Add password</div></div></div>;
}

function ProjectCard({ project, index }) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const featured = ["raaga", "insight"].includes(project.visual);
  useEffect(() => { if (reduce) controls.set("visible"); }, [reduce, controls]);
  return <Motion.article
    className={`project-card${featured ? " project-featured" : ""}`}
    data-glass
    initial={reduce ? false : "hidden"}
    animate={controls}
    onViewportEnter={() => controls.start("visible")}
    onFocusCapture={() => controls.set("visible")}
    viewport={{ once: true, amount: .12 }}
    variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
    transition={{ duration: reduce ? 0 : .55, ease: [.22, 1, .36, 1] }}
  >
    <Motion.div className="project-art" initial="rest" whileHover={reduce ? undefined : "hover"}>
      <ProjectPreview project={project} />
    </Motion.div>
    <div className="project-body">
      <div className="project-meta"><span>{project.type}</span><span>{String(index + 1).padStart(2, "0")} / {featured ? "FEATURED" : "MORE WORK"}</span></div>
      <h3>{project.title}<ArrowUpRight size={25} aria-hidden="true" /></h3>
      <p>{project.description}</p>
      <div className="project-tags">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="project-links">
        <a href={project.live} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} live site (new tab)`}>Explore project <ExternalLink size={15} aria-hidden="true" /></a>
        <a href={project.source} target="_blank" rel="noreferrer" aria-label={`View ${project.title} source code (new tab)`}><Github size={15} aria-hidden="true" /> Source code</a>
      </div>
    </div>
  </Motion.article>;
}

export default function ProjectsSection() {
  return <section id="projects" className="section-block page-wrap selected-work">
    <div className="section-heading section-heading-row"><div><span className="section-index">03 / SELECTED WORK</span><h2>Ideas made real.<br /><span>Details made better.</span></h2></div><div className="work-intro"><p className="section-intro">Creative tools, thoughtful workflows, and the engineering that brings them to life.</p><a className="work-github" href={profile.links.github} target="_blank" rel="noreferrer">More on GitHub <ArrowUpRight size={15} aria-hidden="true" /></a></div></div>
    <div className="projects-grid">{profile.projects.map((project, index) => <ProjectCard key={project.source || project.title} project={project} index={index} />)}</div>
  </section>;
}
