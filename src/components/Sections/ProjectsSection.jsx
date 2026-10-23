import { ArrowUpRight, ExternalLink, Github, LockKeyhole, Sparkles } from "lucide-react";
import { profile } from "../../data/profile";

const ProjectPreview = ({ project }) => project.imageUrl ? (<img className="project-preview" src={project.imageUrl} alt={`${project.title} preview`} loading="lazy" style={{ width: "100%", objectFit: "cover" }} />) : project.visual === "insight" ? (
  <div className="project-preview insight-preview" aria-hidden="true"><div className="mock-window"><div className="mock-window-bar"><i /><i /><i /><span>insightcode.dev</span></div><div className="mock-app"><div className="mock-sidebar"><b>IC</b><span /><span /><span /></div><div className="mock-main"><div className="mock-label">CODE REVIEW</div><div className="mock-code"><i /><i /><i /><i /></div><div className="mock-review"><Sparkles size={12} /><span>Review complete</span><b /></div></div></div></div></div>
) : (
  <div className="project-preview password-preview" aria-hidden="true"><div className="password-card"><div className="password-heading"><span className="password-mark"><LockKeyhole size={15} /></span><span>PassOp</span><i /></div><div className="password-search" /><div className="password-row"><span className="password-app">G</span><div><b>Google</b><small>••••••••••</small></div><span className="password-copy" /></div><div className="password-row"><span className="password-app blue">in</span><div><b>LinkedIn</b><small>••••••••••</small></div><span className="password-copy" /></div><div className="password-add">+ Add password</div></div></div>
);

const ProjectsSection = () => (
  <section id="projects" className="section-block page-wrap">
    <div className="section-heading section-heading-row"><div><span className="section-index">03 / SELECTED WORK</span><h2>Built to solve<br /><span>real problems.</span></h2></div><p className="section-intro">A couple of projects where product thinking and engineering meet.</p></div>
    <div className="projects-grid">{profile.projects.map((project) => <article className="project-card" data-glass key={project.title}>
      <ProjectPreview project={project} />
      <div className="project-body"><div className="project-meta"><span>{project.type}</span><span>PROJECT {project.number}</span></div><h3>{project.title}<ArrowUpRight size={19} /></h3><p>{project.description}</p><div className="project-tags">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-links"><a href={project.live} target="_blank" rel="noreferrer">Live preview <ExternalLink size={15} /></a><a href={project.source} target="_blank" rel="noreferrer">Source code <Github size={15} /></a></div></div>
    </article>)}</div>
  </section>
);

export default ProjectsSection;
