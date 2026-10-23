import { NotesSection } from './Notes.jsx';
import { useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useNavigation } from "./hooks/useNavigation";

// Layout Components
import Navigation from "./components/Layout/Navigation";
import Footer from "./components/Layout/Footer";

// Section Components
import HeroSection from "./components/Sections/HeroSection";
import AboutSection from "./components/Sections/AboutSection";
import SkillsSection from "./components/Sections/SkillsSection";
import ProjectsSection from "./components/Sections/ProjectsSection";
import CurrentProjectSection from "./components/Sections/CurrentProjectSection";
import ExperienceSection from "./components/Sections/ExperienceSection";
import ResumeSection from "./components/Sections/ResumeSection";
import CertificateSection from "./components/Sections/CertificateSection";
import ContactSection from "./components/Sections/ContactSection";
import { replaceProfile } from "./data/profile";
import { API_BASE } from '../shared/browser-config.js';

export default function App() {
  const [profileVersion, setProfileVersion] = useState(0);
  const { isDark, toggleTheme } = useTheme();
  const { isMenuOpen, setIsMenuOpen, activeSection, navItems, scrollToSection } = useNavigation();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/public/profile`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) })
      .then((response) => { if (!response.ok) throw new Error("Portfolio API unavailable"); return response.json(); })
      .then(({ profile: remoteProfile }) => { replaceProfile(remoteProfile); setProfileVersion((version) => version + 1); })
      .catch(() => { /* Keep the bundled public snapshot when the API is unavailable. */ });
    return () => controller.abort();
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--page-progress", `${scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0}`);
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return undefined;

    let activeSurface = null;
    let latestEvent = null;
    let frame = 0;
    const clearActiveSurface = () => {
      activeSurface?.classList.remove("pointer-active");
      activeSurface = null;
    };
    const handlePointerMove = (event) => {
      if (reducedMotion.matches) return;
      latestEvent = event;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = latestEvent.target;
        const surface = target instanceof Element ? target.closest("[data-glass]") : null;
        if (surface !== activeSurface) {
          clearActiveSurface();
          activeSurface = surface;
          activeSurface?.classList.add("pointer-active");
        }
        if (!surface) return;
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty("--pointer-x", `${(latestEvent.clientX - bounds.left).toFixed(1)}px`);
        surface.style.setProperty("--pointer-y", `${(latestEvent.clientY - bounds.top).toFixed(1)}px`);
      });
    };
    const handlePointerOut = (event) => {
      if (!event.relatedTarget) clearActiveSurface();
    };
    const handleMotionPreference = () => {
      if (reducedMotion.matches) clearActiveSurface();
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });
    reducedMotion.addEventListener("change", handleMotionPreference);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      cancelAnimationFrame(frame);
      clearActiveSurface();
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return undefined;

    const revealTargets = [...document.querySelectorAll([
      ".section-block .section-heading",
      ".toolkit-browser",
      ".about-copy > p, .about-copy > a, .about-card",
      ".skill-card, .project-card, .current-project-card",
      ".timeline-item, .education-note, .resume-card",
      ".certificate-wrap > div, .certificate-card, .contact-panel > *",
    ].join(","))];
    const timeline = document.querySelector(".timeline");

    revealTargets.forEach((element, index) => {
      const isAlreadyVisible = element.dataset.reveal === "visible" || element.getBoundingClientRect().top < window.innerHeight * 0.88;
      element.dataset.reveal = isAlreadyVisible ? "visible" : "pending";
      element.style.setProperty("--reveal-delay", `${(index % 3) * 65}ms`);
    });
    root.classList.add("motion-ready");
    const revealForReducedMotion = () => {
      if (!reducedMotion.matches) return;
      revealTargets.forEach((element) => { element.dataset.reveal = "visible"; });
      timeline?.classList.add("timeline-visible");
    };
    reducedMotion.addEventListener("change", revealForReducedMotion);

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.reveal = "visible";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0.04 });
    revealTargets.filter((element) => element.dataset.reveal === "pending").forEach((element) => revealObserver.observe(element));

    const timelineObserver = timeline ? new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      timeline.classList.add("timeline-visible");
      observer.disconnect();
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }) : null;
    if (timeline) timelineObserver?.observe(timeline);

    const hero = document.querySelector(".hero-visual");
    const portrait = hero?.querySelector(".portrait-frame");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pointerFrame = 0;
    let pointerEvent = null;
    const resetPortraitPointer = () => {
      if (!portrait) return;
      portrait.style.setProperty("--portrait-pointer-tilt-x", "0deg");
      portrait.style.setProperty("--portrait-pointer-tilt-y", "0deg");
    };
    const handlePortraitPointerMove = (event) => {
      if (!portrait || !finePointer.matches || reducedMotion.matches) return;
      pointerEvent = event;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const bounds = portrait.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (pointerEvent.clientX - bounds.left) / bounds.width));
        const y = Math.min(1, Math.max(0, (pointerEvent.clientY - bounds.top) / bounds.height));
        portrait.style.setProperty("--portrait-pointer-tilt-x", `${((y - 0.5) * -7).toFixed(2)}deg`);
        portrait.style.setProperty("--portrait-pointer-tilt-y", `${((x - 0.5) * 9).toFixed(2)}deg`);
      });
    };
    const handlePortraitMotionPreference = () => {
      if (reducedMotion.matches) resetPortraitPointer();
    };
    if (portrait && finePointer.matches) {
      portrait.addEventListener("pointermove", handlePortraitPointerMove, { passive: true });
      portrait.addEventListener("pointerleave", resetPortraitPointer, { passive: true });
      reducedMotion.addEventListener("change", handlePortraitMotionPreference);
    }
    let heroInView = false;
    let frame = 0;
    const updateScrollEffects = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (reducedMotion.matches || !heroInView || !portrait) return;
        const bounds = hero.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
        portrait.style.setProperty("--portrait-tilt-x", `${((progress - 0.5) * -3).toFixed(2)}deg`);
        portrait.style.setProperty("--portrait-tilt-y", `${((progress - 0.5) * 4).toFixed(2)}deg`);
        portrait.style.setProperty("--portrait-drift", `${((progress - 0.5) * -20).toFixed(1)}px`);
      });
    };
    const heroObserver = hero ? new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      if (heroInView) updateScrollEffects();
    }, { rootMargin: "100px 0px" }) : null;
    if (hero) heroObserver?.observe(hero);
    updateScrollEffects();
    window.addEventListener("scroll", updateScrollEffects, { passive: true });
    window.addEventListener("resize", updateScrollEffects);

    return () => {
      root.classList.remove("motion-ready");
      reducedMotion.removeEventListener("change", revealForReducedMotion);
      revealObserver.disconnect();
      timelineObserver?.disconnect();
      heroObserver?.disconnect();
      portrait?.removeEventListener("pointermove", handlePortraitPointerMove);
      portrait?.removeEventListener("pointerleave", resetPortraitPointer);
      reducedMotion.removeEventListener("change", handlePortraitMotionPreference);
      window.removeEventListener("scroll", updateScrollEffects);
      window.removeEventListener("resize", updateScrollEffects);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pointerFrame);
    };
  }, [profileVersion]);

  return (
    <div className={`site-root min-h-screen ${isDark ? "dark" : "light"}`}>
      <a className="portfolio-skip" href="#portfolio-main">Skip to content</a>
      <Navigation
        isDark={isDark}
        toggleTheme={toggleTheme}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        navItems={navItems}
      />

      <main id="portfolio-main" tabIndex={-1}>
      <HeroSection scrollToSection={scrollToSection} />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <CurrentProjectSection />
      <ExperienceSection />
      <ResumeSection />
      <CertificateSection />
      <NotesSection />
      <ContactSection />
      </main>

      <Footer scrollToSection={scrollToSection} navItems={navItems} />
    </div>
  );
}
