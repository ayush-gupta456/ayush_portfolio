import { Code, Database, Palette, Settings } from "lucide-react";

const SkillsSection = () => {
  const skills = [
    {
      category: "Programming Languages",
      icon: <Code className="w-6 h-6" />,
      technologies: [
        "JavaScript",
        "Java",
        "Python",
        "C",
        "C++",
        "TypeScript",
        "SQL"
      ],
    },
    {
      category: "Frontend Development",
      icon: <Palette className="w-6 h-6" />,
      technologies: [
        "React.js",
        "HTML5",
        "CSS3",
        "JavaScript",
        "Tailwind CSS",
        "Bootstrap",
        "Responsive Design",
        "UI/UX",
        "Cross-Browser Compatibility",
        "Performance Optimization",
        "Testing & Debugging"
      ],
    },
    {
      category: "Backend Development",
      icon: <Settings className="w-6 h-6" />,
      technologies: [
        "Node.js",
        "Express.js",
        "Java",
        "RESTful APIs",
        "Authentication",
        "Server Architecture",
        "API Integration"
      ],
    },
    {
      category: "Database & Analytics",
      icon: <Database className="w-6 h-6" />,
      technologies: [
        "MongoDB",
        "MySQL",
        "PostgreSQL",
        "SQL"
      ],
    },
    {
      category: "Tools & Platforms",
      icon: <Code className="w-6 h-6" />,
      technologies: [
        "Git",
        "GitHub",
        "Postman",
        "VS Code",
        "Vercel",
        "Netlify",
        "Docker",
        "Deployment"
      ],
    },
  ];

  return (
    <section id="skills" className="py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 space-x-2 text-sm font-medium text-purple-700 rounded-full bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">
            <span>🛠️ Technical Skills</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Technologies I Work With</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            A comprehensive toolkit for building modern, scalable web applications from frontend to backend and
            everything in between.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="p-6 transition-all duration-300 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center mb-4 space-x-3">
                <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  {skill.icon}
                </div>
                <h3 className="text-lg font-bold">{skill.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skill.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-full cursor-default dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
