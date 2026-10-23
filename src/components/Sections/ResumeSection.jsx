import { ArrowDownToLine, ArrowUpRight, FileText } from "lucide-react";

import { profile } from "../../data/profile";

function downloadUrl(value) {
  try { const url=new URL(value);if(url.hostname==='res.cloudinary.com'&&url.pathname.includes('/upload/'))url.pathname=url.pathname.replace('/upload/','/upload/fl_attachment:Ayush-Gupta-Resume/');return url.href; } catch { return value; }
}

const ResumeSection = () => (
  <section id="resume" className="section-block page-wrap resume-block">
    <div className="resume-card" data-glass><div className="resume-icon"><FileText size={23} /></div><div className="resume-copy"><span className="section-index">A CLOSER LOOK</span><h2>Want the full story?</h2><p>Download my résumé for a concise overview of my experience, education, and skills.</p></div><div className="resume-actions"><a className="button button-primary" href={downloadUrl(profile.resumeUrl)} download="Ayush-Gupta-Resume.pdf">Download resume <ArrowDownToLine size={16} /></a><a className="resume-view" href={profile.resumeUrl} target="_blank" rel="noreferrer">View online <ArrowUpRight size={15} /></a></div></div>
  </section>
);

export default ResumeSection;
