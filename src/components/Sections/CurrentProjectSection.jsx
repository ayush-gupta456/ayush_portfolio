import { useEffect, useRef } from "react";
import { ArrowDownRight, ArrowUpRight, Code2, Database, Radio } from "lucide-react";
import { profile } from "../../data/profile";

const CurrentProjectSection = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!scene || !("IntersectionObserver" in window)) return undefined;

    const sceneLayer = scene.querySelector(".cache-scene");
    const cubeLayer = scene.querySelector(".cache-cube");
    let frame = 0;
    let inView = false;
    const updateProgress = () => {
      if (!inView || reduceMotion.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = scene.getBoundingClientRect();
        const travel = window.innerHeight + bounds.height;
        const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / travel));
        sceneLayer?.style.setProperty("--scene-rotate-x", `${((progress - 0.5) * -8).toFixed(2)}deg`);
        sceneLayer?.style.setProperty("--scene-rotate-y", `${((progress - 0.5) * 12).toFixed(2)}deg`);
        cubeLayer?.style.setProperty("--scene-lift", `${((progress - 0.5) * -18).toFixed(1)}px`);
        cubeLayer?.style.setProperty("--scene-cube-rotate", `${((progress - 0.5) * 7).toFixed(2)}deg`);
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && !reduceMotion.matches;
      sceneLayer?.classList.toggle("scene-active", inView);
      cubeLayer?.classList.toggle("scene-active", inView);
      if (inView) updateProgress();
    }, { rootMargin: "120px 0px" });
    const handleMotionPreference = () => {
      if (reduceMotion.matches) {
        inView = false;
        sceneLayer?.classList.remove("scene-active");
        cubeLayer?.classList.remove("scene-active");
        cancelAnimationFrame(frame);
        return;
      }
      inView = scene.getBoundingClientRect().top < window.innerHeight + 120 && scene.getBoundingClientRect().bottom > -120;
      sceneLayer?.classList.toggle("scene-active", inView);
      cubeLayer?.classList.toggle("scene-active", inView);
      if (inView) updateProgress();
    };

    observer.observe(scene);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    reduceMotion.addEventListener("change", handleMotionPreference);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      reduceMotion.removeEventListener("change", handleMotionPreference);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="current-project" className="section-block current-project-section">
      <div className="page-wrap">
        <div className="section-heading section-heading-row">
          <div>
            <span className="section-index">04 / IN PROGRESS</span>
            <h2>Learning by<br /><span>building the internals.</span></h2>
          </div>
          <p className="section-intro">A hands-on project to understand a technology from the inside, one implementation decision at a time.</p>
        </div>

        <article className="current-project-card" data-glass>
          <div className="current-project-copy">
            <div className="current-project-status"><span className="status-dot" />{profile.currentProject.status}</div>
            <span className="current-project-kicker">JAVA · SYSTEMS LEARNING PROJECT</span>
            <h3>{profile.currentProject.title}</h3>
            <p>{profile.currentProject.description}</p>
            <div className="current-project-tags">
              {profile.currentProject.stack.map((item) => <span key={item}>{item}</span>)}
            </div>
            <a className="text-link current-project-link" href={profile.links.github} target="_blank" rel="noreferrer">
              Follow my work <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="current-project-visual" ref={sceneRef} role="img" aria-label="Concept diagram of a client sending a command to a Redis-inspired in-memory key-value store">
            <div className="scene-ambient scene-ambient-one" />
            <div className="scene-ambient scene-ambient-two" />
            <div className="scene-label"><span>CONCEPT MODEL</span><span>SCROLL TO EXPLORE <ArrowDownRight size={13} /></span></div>
            <div className="cache-scene">
              <div className="scene-connector connector-client"><i /></div>
              <div className="scene-connector connector-store"><i /></div>
              <div className="scene-node client-node"><span className="scene-node-icon"><Code2 size={17} /></span><small>CLIENT</small><strong>Command</strong></div>
              <div className="scene-node command-node"><span className="scene-node-icon"><Radio size={17} /></span><small>REQUEST</small><strong>GET / SET</strong></div>
              <div className="cache-cube">
                <div className="cache-cube-face cache-cube-front">
                  <div className="cache-cube-heading"><span><Database size={16} /></span><b>In-memory store</b></div>
                  <div className="cache-entry"><code>key</code><span>session:42</span><b>01</b></div>
                  <div className="cache-entry"><code>value</code><span>••••••••</span><b>02</b></div>
                  <div className="cache-entry"><code>lookup</code><span>fast access</span><b>03</b></div>
                </div>
                <div className="cache-cube-face cache-cube-side" aria-hidden="true" />
                <div className="cache-cube-face cache-cube-top" aria-hidden="true" />
              </div>
              <div className="scene-caption">A small model of the ideas behind a cache</div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default CurrentProjectSection;
