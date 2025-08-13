
const Footer = ({ scrollToSection, navItems }) => {
  return (
    <footer className="py-12 text-white bg-gray-900 dark:bg-gray-950">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6 space-x-3">
            <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              AG
            </div>
            <span className="text-xl font-bold">Ayush Gupta</span>
          </div>
          <p className="max-w-2xl mx-auto mb-8 text-gray-400">
            Building digital experiences that make a difference. Always learning, always growing, always coding.
          </p>
          <div className="flex justify-center mb-8 space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-800">
            <p className="text-gray-500">&copy; 2025 Ayush Gupta. All rights reserved. Built with ❤️ and lots of ☕</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
