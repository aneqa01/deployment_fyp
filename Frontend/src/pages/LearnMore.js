import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaChartLine, FaUserLock, FaCar, FaIdCard, FaFileAlt, FaExchangeAlt } from 'react-icons/fa';

const LearnMorePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <header className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg fixed w-full z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-[#F38120]">SecureChain</Link>
            <Link to="/" className="bg-[#F38120] text-white px-6 py-2 rounded-full hover:bg-[#e0701c] transition duration-300 transform hover:scale-105">Back to Home</Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-center mb-16"
            variants={itemVariants}
          >
            Revolutionizing <span className="text-[#F38120] inline-block">Vehicle Registration</span>
          </motion.h1>

          <motion.div className="grid md:grid-cols-3 gap-8 mb-24" variants={containerVariants}>
            {[
              { icon: FaShieldAlt, title: "Secure", description: "Blockchain-powered security ensures tamper-proof records." },
              { icon: FaChartLine, title: "Efficient", description: "Streamlined processes for faster registrations and transfers." },
              { icon: FaUserLock, title: "Private", description: "Advanced encryption protects user data and privacy." }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <feature.icon className="text-[#F38120] text-5xl mb-6" />
                <h2 className="text-2xl font-semibold mb-4">{feature.title}</h2>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.section 
            className="mb-24"
            variants={containerVariants}
          >
            <motion.h2 className="text-4xl font-bold mb-10 text-center" variants={itemVariants}>How It Works</motion.h2>
            <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants}>
              {[
                { icon: FaCar, title: "Register Vehicle", description: "Enter your vehicle details on our secure platform." },
                { icon: FaIdCard, title: "Verify Identity", description: "Complete blockchain-based identity verification." },
                { icon: FaFileAlt, title: "Receive Certificate", description: "Get your digital certificate of registration." },
                { icon: FaExchangeAlt, title: "Manage Ownership", description: "Easily transfer ownership when needed." }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800 bg-opacity-50 p-6 rounded-xl shadow-lg text-center"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <step.icon className="text-[#F38120] text-4xl mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            variants={containerVariants}
          >
            <motion.h2 className="text-4xl font-bold mb-10 text-center" variants={itemVariants}>Why Choose SecureChain?</motion.h2>
            <motion.div 
              className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg"
              variants={itemVariants}
            >
              <ul className="space-y-6">
                {[
                  "Cutting-edge blockchain technology ensures data integrity",
                  "Faster processing times compared to traditional methods",
                  "Reduced fraud and enhanced security measures",
                  "User-friendly interface for easy navigation and management",
                  "24/7 access to your vehicle registration information"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <span className="text-[#F38120] mr-4">•</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.section>
        </motion.div>
      </main>

      <footer className="bg-black bg-opacity-50 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            &copy; {new Date().getFullYear()} SecureChain. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  );
};

export default LearnMorePage;