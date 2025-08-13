import { ChevronDown, Download, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "../ui/button";

const HeroSection = ({ scrollToSection }) => {
  return (
    <section id="home" className="flex items-center min-h-screen pt-16 sm:pt-20">
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-green-700 rounded-full bg-green-50 dark:bg-green-900/20 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Available for new opportunities</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Building Digital
                <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  Experiences
                </span>
                That Matter
              </h1>
              <h2 className="text-lg font-semibold text-blue-600 sm:text-xl dark:text-blue-400">
                Full Stack Developer & Problem Solver
              </h2>
              <p className="max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-300">
                I create scalable web applications using modern technologies. Passionate about clean code, user
                experience, and solving complex problems through innovative solutions.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => scrollToSection("projects")}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 sm:w-auto"
              >
                View My Work
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("resume")} className="w-full sm:w-auto">
                Download Resume
                <Download className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection("contact")} className="w-full sm:w-auto">
                Get In Touch
                <Mail className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-3 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">250+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7.87</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CGPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">80%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="p-6 bg-white border border-gray-200 shadow-2xl dark:bg-gray-800 rounded-2xl sm:p-8 dark:border-gray-700">
              <div className="space-y-4 text-center sm:space-y-6">
<div className="flex items-center justify-center mx-auto">
  <img
    src="/profile_pic.jpg"
    alt="Ayush Gupta"
    className="object-cover w-20 h-20 border-4 border-white rounded-full shadow-lg sm:w-30 sm:h-30"
  />
</div>
<div>
  <h3 className="text-lg font-bold sm:text-xl">Ayush Gupta</h3>
  <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
    Full Stack Developer
  </p>
</div>
                <div className="flex justify-center space-x-3 sm:space-x-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => scrollToSection("contact")}
                    className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/20 touch-friendly"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>

                  <a
                    href="https://www.linkedin.com/in/ayush-gupta456/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/20 touch-friendly"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/ayush-gupta456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 transition-colors bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/20 touch-friendly"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
