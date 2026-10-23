import Portrait from '../Portrait.jsx';
import { ArrowUpRight, MapPin } from "lucide-react";
import { profile } from "../../data/profile";

const AboutSection = () => (
  <section id="about" className="section-block page-wrap">
    <div className="section-heading"><span className="section-index">01 / ABOUT</span><h2>Curious by nature.<br /><span>Builder by choice.</span></h2></div>
    <div className="about-content">
      <div className="about-copy">
        <p className="large-copy">I’m a computer science graduate with a practical interest in building software that feels as good to use as it is to engineer.</p>
        <p>From full-stack side projects to enterprise commerce systems, I like understanding the whole problem — then making the solution straightforward, reliable, and easy to use.</p>
        <a className="text-link" href={profile.links.linkedin} target="_blank" rel="noreferrer">More about my work <ArrowUpRight size={16} /></a>
      </div>
      <aside className="about-card">
        <div className="about-avatar"><Portrait/></div>
        <div><span className="note-kicker">BASED IN</span><p className="about-location"><MapPin size={15} />{profile.location}</p></div>
        <div className="about-card-rule" />
        <div className="about-facts"><div><span>EDUCATION</span><strong>{profile.education.degree}</strong></div><div><span>UNIVERSITY</span><strong>{profile.education.school}</strong></div><div><span>GPA</span><strong>{profile.education.gpa} / 10</strong></div></div>
      </aside>
    </div>
  </section>
);

export default AboutSection;
