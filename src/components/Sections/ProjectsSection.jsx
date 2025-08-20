import { ExternalLink, Github } from "lucide-react";
import { Button } from "../ui/button";

const ProjectsSection = () => {
  const projects = [
{
  title: "PassKeeper",
  description:
    "A secure password manager that allows users to store, search, and manage credentials with JWT-based authentication, encryption, and a responsive UI.",
  technologies: [
    "React.js",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "MongoDB",
    "JWT (JSON Web Token)"
  ],
  features: [
    "JWT-based authentication with secure password hashing using bcrypt",
    "Role-based access control for managing different permission levels",
    "Client-side encryption for saved credentials with copy-to-clipboard functionality",
    "Integrated password generator and strength analyzer",
    "Advanced search and filtering across stored credentials",
    "Optimized RESTful APIs with validation, rate limiting, and CORS handling",
    "Fully responsive Tailwind CSS UI ensuring cross-device compatibility"
  ],
  liveUrl: "https://passmongoop.netlify.app/login",
  githubUrl: "https://github.com/ayush-gupta456/pass_op",
  period: "May – August 2025"
},
{
  title: "InsightCode",
  description:
    "An AI-powered code reviewer and analyzer that helps developers write better code by providing automated reviews, debugging assistance, and complexity analysis with an interactive and modern UI.",
  technologies: [
    "React.js (Vite)",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "Google Gemini API"
  ],
  features: [
    "AI-driven code review with suggestions for improvements and best practices",
    "Automated debugging support with detailed trace outputs",
    "Time and space complexity analysis for submitted code",
    "Secure backend API integration with JWT-based authentication",
    "Modern and responsive React UI with smooth animations and transitions",
    "Copy-to-clipboard and export options for AI-generated reviews",
    "Deployment-ready structure with separate frontend and backend layers"
  ],
  liveUrl: "https://insightcode.vercel.app/",
  githubUrl: "https://github.com/ayush-gupta456/InsightCode",
  period: "August 2025 "
},

{
  title: "BookAndRent",
  description:
    "An intuitive platform for browsing and booking rental properties—whether for short stays or long-term rentals—featuring secure JWT authentication, TypeScript-powered backend reliability, and a streamlined booking workflow.",
  technologies: [
    "React.js",
    "TypeScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "JWT (JSON Web Token)"
  ],
  features: [
    "TypeScript integration in backend for improved type safety and maintainability",
    "JWT-based authentication with bcrypt-secured password hashing",
    "Create, update, and delete property listings with image upload support",
    "Advanced search and filter options by location, price, and amenities",
    "Booking system with real-time availability checks",
    "Responsive React UI ensuring smooth experience across all devices",
    "Optimized backend APIs with request validation, rate limiting, and error handling"
  ],
  liveUrl: "https://bookandrent.netlify.app/",
  githubUrl: "https://github.com/ayush-gupta456/Book_Rent",
  period: "December 2024 – March 2025"
},
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 space-x-2 text-sm font-medium text-green-700 rounded-full bg-green-50 dark:bg-green-900/20 dark:text-green-400">
            <span>🚀 Featured Work</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Projects That Showcase My Skills</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            A collection of projects that demonstrate my ability to build scalable, user-friendly applications using
            modern web technologies.
          </p>
        </div>

        <div className="space-y-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-xl dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-2xl"
            >
              <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex flex-col mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="mb-2 text-2xl font-bold sm:mb-0">{project.title}</h3>
                  <span className="px-3 py-1 text-sm rounded-full bg-white/20">{project.period}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className="px-3 py-1 text-sm font-medium rounded-lg bg-white/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">{project.description}</p>

                <div className="mb-6">
                  <ul className="space-y-2">
                    {project.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-green-600 rounded-full dark:bg-green-400"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {project.liveUrl && (
                    <Button asChild className="w-full text-white bg-blue-600 hover:bg-blue-700 sm:w-auto">
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        Live Demo
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      View Code
                      <Github className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
