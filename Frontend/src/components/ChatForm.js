import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [resultMessage, setResultMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMessage('Please wait...');

    const jsonFormData = JSON.stringify({
      ...formData,
      access_key: '0bf91992-bb1f-4c79-b2f3-46d49000f7cb',
      botcheck: '',
    });

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: jsonFormData,
      });

      const json = await response.json();

      if (response.status === 200) {
        setResultMessage('Form submitted successfully! We will be contacting you soon.');
      } else {
        setResultMessage(json.message);
      }
    } catch (error) {
      setResultMessage('Something went wrong!');
      console.log(error);
    }

    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      message: '',
    });

    setTimeout(() => {
      setResultMessage('');
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto p-8 bg-gradient-to-br from-[#2A2D34] to-[#4A4D52] text-gray-200 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-[#F38120] opacity-10"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <h3 className="text-3xl font-bold text-[#F38120] text-center mb-8 relative">
        Get in Touch
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#F38120]"
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </h3>
      <form onSubmit={handleSubmit} id="form" className="space-y-6">
        <input
          type="hidden"
          name="access_key"
          value="0bf91992-bb1f-4c79-b2f3-46d49000f7cb"
        />

        <motion.div
          className="relative"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-transparent border-b-2 border-[#F38120] p-2 focus:outline-none focus:border-white transition-colors text-white placeholder-gray-400"
            placeholder="Your Name"
          />
          <motion.label
            htmlFor="name"
            className="absolute left-0 -top-6 text-sm text-[#F38120] transition-all duration-300"
            initial={{ y: 0 }}
            animate={{ y: formData.name ? -24 : 0 }}
          >
            Name
          </motion.label>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-transparent border-b-2 border-[#F38120] p-2 focus:outline-none focus:border-white transition-colors text-white placeholder-gray-400"
            placeholder="Your Email"
          />
          <motion.label
            htmlFor="email"
            className="absolute left-0 -top-6 text-sm text-[#F38120] transition-all duration-300"
            initial={{ y: 0 }}
            animate={{ y: formData.email ? -24 : 0 }}
          >
            Email
          </motion.label>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <textarea
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full bg-transparent border-b-2 border-[#F38120] p-2 focus:outline-none focus:border-white transition-colors text-white placeholder-gray-400 resize-none h-32"
            placeholder="Your Message"
          />
          <motion.label
            htmlFor="message"
            className="absolute left-0 -top-6 text-sm text-[#F38120] transition-all duration-300"
            initial={{ y: 0 }}
            animate={{ y: formData.message ? -24 : 0 }}
          >
            Message
          </motion.label>
        </motion.div>

        <motion.div
          className="relative overflow-hidden"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-[#F38120] text-white font-bold rounded-full shadow-md hover:bg-[#e0701c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F38120] transition-colors duration-300 ease-in-out"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </motion.button>
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isSubmitting ? 1 : 0 }}
            style={{ originX: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {resultMessage && (
          <motion.div
            id="result"
            className="mt-4 text-center text-[#F38120]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {resultMessage}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default ContactForm;