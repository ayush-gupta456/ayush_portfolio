import { Mail, MapPin, Phone } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 space-x-2 text-sm font-medium text-blue-700 rounded-full bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400">
            <span>👨‍💻 About Me</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Crafting Solutions Through Code</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            A passionate developer with a strong foundation in computer science and a keen eye for creating
            exceptional digital experiences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 md:gap-8">
          <div className="lg:col-span-2">
            <div className="p-8 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  I'm a passionate full-stack developer currently pursuing my Bachelor of Technology in Computer
                  Science at GLA University, Mathura. With a strong foundation in modern web technologies and
                  a keen eye for user experience, I love creating applications that solve real-world problems.
                </p>
                <p>
                  My journey in tech has been driven by curiosity and a constant desire to learn. I've completed over
                  250 coding challenges on platforms like LeetCode and HackerRank, maintaining an 80% success rate.
                  This has helped me develop strong problem-solving skills and a deep understanding of data structures
                  and algorithms.
                </p>
                <p>
                  When I'm not coding, you'll find me exploring new technologies, contributing to open-source
                  projects, or mentoring fellow students. I believe in the power of collaboration and continuous
                  learning in the ever-evolving world of technology.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-xl font-bold text-white rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                AG
              </div>
              <h3 className="text-xl font-bold">Ayush Gupta</h3>
              <p className="text-gray-600 dark:text-gray-400">Computer Science Student</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">GLA University, Mathura</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center p-3 space-x-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">omayush456.ag@gmail.com</span>
              </div>
              <div className="flex items-center p-3 space-x-3">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">+91 8604411331</span>
              </div>
              <div className="flex items-center p-3 space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">Lucknow, Uttar Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
