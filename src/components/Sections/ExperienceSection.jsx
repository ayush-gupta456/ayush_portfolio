
const ExperienceSection = () => {
  return (
    <section id="experience" className="py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 space-x-2 text-sm font-medium text-orange-700 rounded-full bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400">
            <span>📚 Experience & Education</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">My Journey in Technology</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            From academic excellence to hands-on industry experience, here's how I've built my foundation in computer
            science and software development.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="p-6 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex flex-col mb-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold">Bachelor of Technology - Computer Science (Honors)</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">Expected Jun 2026</span>
            </div>
            <p className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              GLA University, Mathura • CGPA: 7.87
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Pursuing comprehensive education in computer science with specialized focus on software development,
              data structures, algorithms, and modern web technologies.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex flex-col mb-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold">Trainee - Job Oriented Value Added Course (AWS-Cloud Computing)</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">Jun 2024 - Jul 2024</span>
            </div>
            <p className="mb-3 font-semibold text-blue-600 dark:text-blue-400">GLA University • Remote</p>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Successfully completed the JOVAC (Job Oriented Value Added Course) on AWS-Cloud Computing,
              organized by the Department of CEA, GLA University, and delivered by Bhupinder Rajput.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Acquired hands-on knowledge in AWS services and cloud computing fundamentals
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Learned practical deployment and management of cloud-based applications using AWS
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Certificate No.: TG/2024/JOVAC/148 (Issued on 31 July 2024)
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex flex-col mb-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold">Senior Secondary Education</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">2022</span>
            </div>
            <p className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              ST. JOSEPH INTER COLLEGE, LUCKNOW
            </p>
            <p className="mb-3 text-gray-600 dark:text-gray-300">
              Successfully completed Senior Secondary (Class 12) education with strong academic performance in Mathematics, Physics, Chemistry, Computer Science, and Physical Education.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
