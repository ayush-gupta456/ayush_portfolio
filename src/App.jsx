import React, { useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { useNavigation } from "./hooks/useNavigation";
import { initEmailJS } from "./utils/emailjs";

// Layout Components
import Navigation from "./components/Layout/Navigation";
import Footer from "./components/Layout/Footer";

// Section Components
import HeroSection from "./components/Sections/HeroSection";
import AboutSection from "./components/Sections/AboutSection";
import SkillsSection from "./components/Sections/SkillsSection";
import ProjectsSection from "./components/Sections/ProjectsSection";
import ExperienceSection from "./components/Sections/ExperienceSection";
import ResumeSection from "./components/Sections/ResumeSection";
import CertificateSection from "./components/Sections/CertificateSection";
import ContactSection from "./components/Sections/ContactSection";

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { isMenuOpen, setIsMenuOpen, activeSection, navItems, scrollToSection } = useNavigation();

  // Initialize EmailJS on app start
  useEffect(() => {
    initEmailJS();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Navigation
        isDark={isDark}
        toggleTheme={toggleTheme}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        navItems={navItems}
      />

      <HeroSection scrollToSection={scrollToSection} />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ResumeSection />
      <CertificateSection />
      <ContactSection />

      <Footer scrollToSection={scrollToSection} navItems={navItems} />
    </div>
  );
}