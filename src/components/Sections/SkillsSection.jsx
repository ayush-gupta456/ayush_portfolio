import { useState } from "react";
import { Braces, Cloud, Database, Layers3, PackageCheck } from "lucide-react";
import { profile } from "../../data/profile";

const icons = [Braces, Layers3, Database, Braces, PackageCheck, Cloud];
const descriptions = {
  Languages: "Programming fundamentals for problem solving, application development, and data queries.",
  Frontend: "The building blocks I use to create responsive, polished web interfaces.",
  "Backend & data": "Server-side development, APIs, data access, and persistence across Java and JavaScript.",
  "Java & Spring": "Java application development with the Spring framework and Spring Boot.",
  "SAP Commerce Cloud": "Commerce platform work across catalog, content, APIs, search, imports, and scheduled jobs.",
  "Testing & tools": "Testing, collaboration, API inspection, containers, and deployment tools.",
};

const SkillsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = activeIndex < profile.skills.length ? activeIndex : 0;
  const activeGroup = profile.skills[selectedIndex];
  const ActiveIcon = icons[selectedIndex] ?? Braces;

  return (
    <section id="skills" className="section-block section-tinted">
      <div className="page-wrap">
        <div className="section-heading section-heading-row"><div><span className="section-index">02 / TOOLKIT</span><h2>Tools for turning<br /><span>ideas into products.</span></h2></div><p className="section-intro">Explore the technologies I use, grouped by the kind of work they support.</p></div>
        <div className="toolkit-browser">
          <div className="toolkit-categories" role="group" aria-label="Technology categories">
            {profile.skills.map((group, index) => {
              const Icon = icons[index] ?? Braces;
              const selected = index === selectedIndex;
              return (
                <button className={`toolkit-category${selected ? " is-active" : ""}`} key={group.category} type="button" data-glass aria-pressed={selected} onClick={() => setActiveIndex(index)}>
                  <span className="toolkit-category-icon"><Icon size={16} aria-hidden="true" /></span>
                  <span className="toolkit-category-name"><small>{String(index + 1).padStart(2, "0")}</small>{group.category}</span>
                  <span className="toolkit-category-count">{group.items.length}</span>
                </button>
              );
            })}
          </div>
          {activeGroup ? <div className="toolkit-detail" key={activeGroup.category} data-glass role="region" aria-label={`${activeGroup.category} skills`} aria-live="polite">
            <div className="toolkit-detail-heading">
              <span className="toolkit-detail-icon"><ActiveIcon size={18} aria-hidden="true" /></span>
              <div><span className="section-index">CATEGORY {String(selectedIndex + 1).padStart(2, "0")}</span><h3>{activeGroup.category}</h3></div>
              <span className="toolkit-detail-count">{activeGroup.items.length} skills</span>
            </div>
            <p>{descriptions[activeGroup.category] ?? "Tools and technologies I use to build and support useful software."}</p>
            <div className="toolkit-skills">
              {activeGroup.items.map((item, index) => <span key={item} style={{ "--chip-index": index }}>{item}</span>)}
            </div>
          </div> : <p className="toolkit-empty">The toolkit is being updated. Please check back soon.</p>}
        </div>
    </div>
  </section>
  );
};

export default SkillsSection;
