
import { Award, Calendar, ExternalLink, Eye, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const CertificateSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Certificate data - Update this with your actual certificates
  const certificates = [
    {
      id: 1,
      title: "Microsoft Azure Cloud Computing",
      issuer: "Microsoft",
      date: "2025",
      category: "cloud",
      image: "/certificates/cloud_microsoft.png",
      credentialUrl: "#", // Add your actual credential URL
      description: "Comprehensive cloud computing certification covering Azure services, deployment, and management."
    },
    {
      id: 2,
      title: "CSS3 Certification",
      issuer: "Infosys Springboard",
      date: "2025",
      category: "frontend",
      image: "/certificates/css3_infosys_springboard.png",
      credentialUrl: "#",
      description: "Advanced CSS3 certification covering modern styling techniques, animations, and responsive design."
    },
    {
      id: 3,
      title: "Describe Cloud Computing",
      issuer: "Microsoft",
      date: "2025",
      category: "cloud",
      image: "/certificates/describe_cloud_computing_microsoft.png",
      credentialUrl: "#",
      description: "Foundational certification describing cloud computing concepts, services, and deployment models."
    },
    {
      id: 4,
      title: "JavaScript Certification",
      issuer: "Infosys Springboard",
      date: "2024",
      category: "frontend",
      image: "/certificates/javascript_infosys_springboard.png",
      credentialUrl: "#",
      description: "Comprehensive JavaScript certification covering ES6+, DOM manipulation, and modern frameworks."
    },
    {
      id: 5,
      title: "AWS Cloud Computing",
      issuer: "JOVAC",
      date: "2024",
      category: "cloud",
      image: "/certificates/jovac_aws_cloud_computing.png",
      credentialUrl: "#",
      description: "AWS cloud computing certification covering core services, architecture, and best practices."
    },
    {
      id: 6,
      title: "React Development",
      issuer: "Udemy",
      date: "2025",
      category: "frontend",
      image: "/certificates/react_udemy.png",
      credentialUrl: "#",
      description: "Complete React development course covering hooks, context, routing, and modern React patterns."
    }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Certificates', count: certificates.length },
    { id: 'cloud', label: 'Cloud Computing', count: certificates.filter(cert => cert.category === 'cloud').length },
    { id: 'frontend', label: 'Frontend Development', count: certificates.filter(cert => cert.category === 'frontend').length },
  ];

  // Filtered certificates based on selected category
  const filteredCertificates = useMemo(() => {
    if (selectedCategory === 'all') {
      return certificates;
    }
    return certificates.filter(cert => cert.category === selectedCategory);
  }, [selectedCategory, certificates]);

  // Statistics
  const stats = {
    total: certificates.length,
    categories: categories.length - 1, // Exclude 'all' category
    latestYear: Math.max(...certificates.map(cert => parseInt(cert.date))),
    providers: [...new Set(certificates.map(cert => cert.issuer))].length
  };


  // Open modal and trap focus
  const openCertificateModal = (certificate) => {
    setSelectedCertificate(certificate);
    document.body.style.overflow = 'hidden';
  };

  // Close modal and restore scroll
  const closeCertificateModal = () => {
    setSelectedCertificate(null);
    document.body.style.overflow = '';
  };

  const viewCertificateCredential = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Close modal on Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedCertificate) {
        closeCertificateModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedCertificate]);

  return (
    <section
      id="certificates"
      className="py-20 transition-colors duration-300 bg-white dark:bg-gray-900"
    >
      <div className="container px-6 mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
            Certifications
          </h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-blue-600"></div>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            Professional certifications and achievements that demonstrate my expertise
            and commitment to continuous learning in technology.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((certificate) => (
            <div
              key={certificate.id}
              className="p-6 transition-all duration-300 rounded-lg shadow-md group bg-gray-50 hover:shadow-xl hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {/* Certificate Image */}
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={certificate.image}
                  alt={`${certificate.title} certificate`}
                  className="object-cover w-full h-48 transition-transform duration-300 cursor-pointer group-hover:scale-105"
                  onClick={() => openCertificateModal(certificate)}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                    e.target.alt = 'Certificate preview not available';
                  }}
                />
              </div>

              {/* Certificate Details */}
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                  {certificate.title}
                </h3>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4" />
                  <span>{certificate.issuer}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{certificate.date}</span>
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {certificate.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openCertificateModal(certificate)}
                  className="inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </button>
                {certificate.credentialUrl && certificate.credentialUrl !== '#' && (
                  <button
                    onClick={() => viewCertificateCredential(certificate.credentialUrl)}
                    className="inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No certificates message */}
        {filteredCertificates.length === 0 && (
          <div className="py-16 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No certificates found in this category.
            </p>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={closeCertificateModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selectedCertificate.title}
                  </h3>
                  <div className="mt-2 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedCertificate.issuer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedCertificate.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeCertificateModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6">
                <img
                  src={selectedCertificate.image}
                  alt={`${selectedCertificate.title} certificate`}
                  className="object-contain w-full rounded-lg max-h-96"
                  onError={e => {
                    e.target.src = '/placeholder.svg';
                    e.target.alt = 'Certificate preview not available';
                  }}
                />
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Description</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedCertificate.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CertificateSection;
