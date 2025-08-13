import { AlertCircle, Download, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";

const ResumeSection = () => {
  // Path and filename of your resume (must be in /public/resume/)
  const resumeUrl = "/resume/Ayush_resume.pdf";
  const resumeFilename = "Ayush_resume.pdf";

  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [resumeAvailable, setResumeAvailable] = useState(true);

  useEffect(() => {
    // Detect if user is on mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    // Check if resume file is available on component mount
    const checkResumeAvailability = async () => {
      try {
        const response = await fetch(resumeUrl, { method: 'HEAD' });
        setResumeAvailable(response.ok);
        if (!response.ok) {
          setError('Resume file is currently unavailable.');
        }
      } catch (err) {
        setResumeAvailable(false);
        setError('Unable to verify resume availability.');
      }
    };
    
    checkResumeAvailability();
  }, [resumeUrl]);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if file exists
      const response = await fetch(resumeUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Resume file not found');
      }
      
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = resumeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError('Failed to download resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    try {
      setError(null);
      
      // Check if file exists
      const response = await fetch(resumeUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Resume file not found');
      }
      
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error('Error viewing resume:', err);
      setError('Failed to open resume. Please try downloading instead.');
    }
  };

  return (
    <section
      id="resume"
      className="py-20 transition-colors duration-300 bg-gray-50 dark:bg-gray-800"
    >
      <div className="container px-6 mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
            Resume
          </h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-blue-600"></div>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Download or view my detailed resume to learn more about my
            professional experience, education, and technical skills.
          </p>
        </div>

        {/* Resume Card */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 transition-all duration-300 bg-white rounded-lg shadow-lg dark:bg-gray-900 hover:shadow-xl">
            <div className="text-center">

              {/* Resume Icon */}
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full dark:bg-blue-900">
                <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Resume Title & Description */}
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
                My Resume
              </h3>
              <p className="max-w-lg mx-auto mb-8 text-gray-600 dark:text-gray-300">
                Get a comprehensive overview of my professional journey, skills,
                and achievements in a well-structured PDF format.
              </p>

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center gap-2 p-4 mb-6 text-red-600 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Downloading...' : 'Download Resume'}
                </button>
                <button
                  onClick={() => (isMobile ? handleDownload() : handleView())}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 font-medium text-blue-600 transition-colors duration-200 border-2 border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {isMobile ? "Open & Download" : "View Online"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;
