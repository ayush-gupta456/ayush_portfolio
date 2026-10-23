import { BriefcaseBusiness, GraduationCap, Workflow } from "lucide-react";
import { profile } from "../../data/profile";

const icons = [BriefcaseBusiness, GraduationCap, Workflow];

const ExperienceSection = () => (
  <section id="experience" className="section-block section-tinted experience-section">
    <div className="page-wrap">
      <div className="section-heading section-heading-row experience-heading">
        <div>
          <span className="section-index">05 / EXPERIENCE</span>
          <h2>A path shaped by<br /><span>learning and making.</span></h2>
        </div>
        <div className="experience-intro">
          <span className="experience-status"><i aria-hidden="true" /> THE JOURNEY SO FAR</span>
          <p>From computer science fundamentals to contributing in an enterprise environment.</p>
        </div>
      </div>

      <div className="timeline" aria-label="Experience and education timeline">
        {profile.experience.map((item, index) => {
          const Icon = icons[index] ?? Workflow;
          return (
            <article className={`timeline-item${index === 0 ? " timeline-item-featured" : ""}`} key={item.title}>
              <div className="timeline-rail" aria-hidden="true">
                <span className="timeline-marker"><Icon size={17} /></span>
                <span className="timeline-sequence">0{index + 1}</span>
              </div>
              <div className="timeline-main" data-glass>
                <div className="timeline-top">
                  <span className="timeline-kind">{item.kind}</span>
                  <time>{item.period}</time>
                </div>
                <h3>{item.title}</h3>
                <p className="timeline-org">{item.organization}</p>
                <p className="timeline-description">{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="education-note" data-glass>
        <div className="education-note-heading">
          <span className="education-note-icon" aria-hidden="true"><GraduationCap size={17} /></span>
          <span className="section-index">EARLIER EDUCATION</span>
        </div>
        <div className="education-records">
          <p><strong>Intermediate (ISC)</strong><span className="education-score">75.83%</span><span className="education-school">St. Joseph Inter College, Lucknow</span><time>2022</time></p>
          <p><strong>High School (ICSE)</strong><span className="education-score">82%</span><span className="education-school">St. Joseph Inter College, Lucknow</span><time>2019</time></p>
        </div>
      </div>
    </div>
  </section>
);

export default ExperienceSection;
