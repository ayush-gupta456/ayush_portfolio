import { useState } from "react";
import { ArrowUpRight, Award, Cloud, Code2, Database, Layers3 } from "lucide-react";
import { profile } from "../../data/profile";

const categoryIcons = {
  Cloud,
  Data: Database,
  Engineering: Code2,
  "Web development": Layers3,
};

const CertificateSection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...new Set(profile.certifications.map((item) => item.category))];
  const selectedCategory = categories.includes(activeCategory) ? activeCategory : "All";
  const visibleCertificates = selectedCategory === "All"
    ? profile.certifications
    : profile.certifications.filter((item) => item.category === selectedCategory);

  return (
    <section id="certificates" className="section-block section-tinted certificate-section">
      <div className="page-wrap certificate-wrap">
        <div className="certificate-intro">
          <div className="certificate-heading">
            <span className="section-index">CONTINUOUS LEARNING</span>
            <h2>Credentials &amp; <span>certifications.</span></h2>
          </div>
          <div className="certificate-overview">
            <p>Learning across software engineering, web development, data, and cloud technologies.</p>
            <div className="certificate-summary">
              <span className="certificate-summary-icon"><Award size={17} aria-hidden="true" /></span>
              <span><strong>{profile.certifications.length}</strong><small>credentials</small></span>
              <i aria-hidden="true" />
              <span><strong>{new Set(profile.certifications.map((item) => item.category)).size}</strong><small>learning tracks</small></span>
            </div>
          </div>
        </div>

        <div className="certificate-filter-row">
          <div className="certificate-filters" role="group" aria-label="Filter certificates by category">
            {categories.map((category) => {
              const count = category === "All"
                ? profile.certifications.length
                : profile.certifications.filter((item) => item.category === category).length;
              const selected = selectedCategory === category;
              return (
                <button
                  className={`certificate-filter${selected ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  key={category}
                >
                  {category === "Web development" ? "Web Dev" : category}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
          <p className="certificate-result-count" aria-live="polite">
            Showing <strong>{visibleCertificates.length}</strong> of {profile.certifications.length}
          </p>
        </div>

        <div className="certificate-list" aria-label={`${selectedCategory} certificates`}>
          {visibleCertificates.map((certificate, index) => {
            const Icon = categoryIcons[certificate.category] ?? Award;
            const href = certificate.url || (certificate.fileId
              ? `https://drive.google.com/file/d/${certificate.fileId}/view?usp=sharing`
              : certificate.image);

            return (
              <a
                className={`certificate-card${selectedCategory === "All" ? "" : " certificate-card--enter"}`}
                data-glass
                data-reveal="visible"
                style={{ "--certificate-index": index }}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${certificate.title} certificate from ${certificate.issuer}`}
                key={`${certificate.issuer}-${certificate.title}`}
              >
                <span className="certificate-card-icon"><Icon size={17} aria-hidden="true" /></span>
                <span className="certificate-card-copy">
                  <span className="certificate-card-category">{certificate.category}</span>
                  <strong>{certificate.title}</strong>
                  <small>{certificate.issuer}</small>
                </span>
                <ArrowUpRight className="certificate-card-open" size={17} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CertificateSection;
