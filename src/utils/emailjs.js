import emailjs from '@emailjs/browser';

// EmailJS configuration
const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  autoReplyTemplateId: import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

// Initialize EmailJS
export const initEmailJS = () => {
  if (emailjsConfig.publicKey) {
    emailjs.init(emailjsConfig.publicKey);
  } else {
    console.warn('EmailJS public key not found. Please check your .env file.');
  }
};

// Send main email function
export const sendEmail = async (formData) => {
  try {
    // Check if all required config is available
    if (!emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.publicKey) {
      throw new Error('EmailJS configuration is incomplete. Please check your .env file.');
    }

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_name: 'Ayush Gupta',
      to_email: 'omayush456.ag@gmail.com',
      reply_to: formData.email,
      current_time: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
    };

    const result = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      emailjsConfig.publicKey
    );

    return {
      success: true,
      data: result,
      message: 'Email sent successfully!',
    };
  } catch (error) {
    console.error('EmailJS Error:', error);

    let errorMessage = 'Failed to send email. Please try again.';

    if (error.message.includes('configuration')) {
      errorMessage = 'Email service is not properly configured. Please contact the administrator.';
    } else if (error.status === 422) {
      errorMessage = 'Invalid email data. Please check your input and try again.';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    }

    return {
      success: false,
      error: error,
      message: errorMessage,
    };
  }
};

// Send auto-reply email function
export const sendAutoReply = async (formData) => {
  try {
    // Check if auto-reply template is configured
    if (!emailjsConfig.autoReplyTemplateId) {
      console.warn('Auto-reply template not configured. Skipping auto-reply.');
      return {
        success: true,
        message: 'Auto-reply not configured',
        skipped: true,
      };
    }

    const autoReplyParams = {
      to_name: formData.name,
      to_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      from_name: 'Ayush Gupta',
      from_email: 'omayush456.ag@gmail.com',
      current_time: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
    };

    const result = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.autoReplyTemplateId,
      autoReplyParams,
      emailjsConfig.publicKey
    );

    return {
      success: true,
      data: result,
      message: 'Auto-reply sent successfully!',
    };
  } catch (error) {
    console.error('Auto-reply Error:', error);
    // Don't fail the main process if auto-reply fails
    return {
      success: false,
      error: error,
      message: 'Auto-reply failed, but main message was sent',
    };
  }
};

// Combined function to send both emails
export const sendEmailWithAutoReply = async (formData) => {
  try {
    // Send main email first
    const mainResult = await sendEmail(formData);

    if (!mainResult.success) {
      return mainResult;
    }

    // Send auto-reply if main email succeeded
    const autoReplyResult = await sendAutoReply(formData);
    return {
      success: true,
      mainEmail: mainResult,
      autoReply: autoReplyResult,
      message: autoReplyResult.skipped
        ? `Thank you ${formData.name}! Your message has been sent successfully.`
        : `Thank you ${formData.name}! Your message has been sent successfully and you should receive a confirmation email shortly.`,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error,
      message: 'Failed to send message. Please try again.',
    };
  }
};

// Validate email configuration
export const validateEmailConfig = () => {
  const isValid = emailjsConfig.serviceId &&
    emailjsConfig.templateId &&
    emailjsConfig.publicKey;

  if (!isValid) {
    console.warn('EmailJS configuration is incomplete:', {
      serviceId: !!emailjsConfig.serviceId,
      templateId: !!emailjsConfig.templateId,
      autoReplyTemplateId: !!emailjsConfig.autoReplyTemplateId,
      publicKey: !!emailjsConfig.publicKey,
    });
  }

  return isValid;
};
