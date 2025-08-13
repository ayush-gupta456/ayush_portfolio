import { AlertCircle, CheckCircle, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { sendEmailWithAutoReply, validateEmailConfig } from "../../utils/emailjs";
import { Button } from "../ui/button";

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: null,
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const formValues = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    // Debug: Log form values to console
    console.log('Form Values being sent:', formValues);

    try {
      // Validate EmailJS configuration
      if (!validateEmailConfig()) {
        throw new Error('Email service is not properly configured.');
      }

      // Send email with auto-reply using EmailJS
      const result = await sendEmailWithAutoReply(formValues);
      
      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: result.message,
        });
        
        if (form) {
          form.reset();
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitStatus.type) {
      const timer = setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 space-x-2 text-sm font-medium text-pink-700 rounded-full bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400">
            <span>📬 Get In Touch</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Let's Build Something Amazing Together</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Whether you have a project in mind, want to collaborate, or just want to say hello, I'd love to hear from
            you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="p-8 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h3 className="mb-6 text-2xl font-bold">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 space-x-4 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-600 dark:text-gray-400">omayush456.ag@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center p-4 space-x-4 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-r from-green-600 to-blue-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-gray-600 dark:text-gray-400">+91 8604411331</p>
                </div>
              </div>

              <div className="flex items-center p-4 space-x-4 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Location</h4>
                  <p className="text-gray-600 dark:text-gray-400">Lucknow, Uttar Pradesh, India</p>
                </div>
              </div>

              <div className="flex pt-4 space-x-4">
                <a
                  href="https://www.linkedin.com/in/ayush-gupta456/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/ayush-gupta456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <h3 className="mb-6 text-2xl font-bold">Send me a message</h3>

            {submitStatus.type && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                  submitStatus.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle className="flex-shrink-0 w-5 h-5" />
                ) : (
                  <AlertCircle className="flex-shrink-0 w-5 h-5" />
                )}
                <p className="text-sm">{submitStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2 text-sm font-medium">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  disabled={isSubmitting}
                  placeholder="Tell me about your project or just say hello!"
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
                ></textarea>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Mail className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
