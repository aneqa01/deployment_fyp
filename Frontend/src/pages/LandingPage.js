import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
  FaChevronDown,
  FaArrowRight,
  FaUsers,
  FaLock,
  FaRocket,
} from 'react-icons/fa';
import { AiOutlineMenu } from 'react-icons/ai';
import ContactForm from '../components/ChatForm';
import LoadingPage from './Loading';

const TriangleBackground = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none" // <--- add pointer-events-none
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="triangles"
        width="50"
        height="43.3"
        patternUnits="userSpaceOnUse"
        patternTransform="scale(2)"
      >
        <path
          d="M25 0 L50 43.3 L0 43.3 Z"
          fill="none"
          stroke="#F38120"
          strokeOpacity="0.1"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#triangles)" />
    </svg>
  );
};

const StarryBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none"> 
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${Math.random() * 5 + 5}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
};

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-200 bg-opacity-90 backdrop-blur-md shadow-md z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <a href="#" className="flex items-center">
              <img src="/SC.png" alt="Logo" className="h-12 w-auto sm:h-14" />
              <span className="ml-2 text-xl font-bold text-[#F38120]">BlockChain Based Vehicle Registeration System</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              className="bg-gray-200 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#F38120]"
              onClick={() => setNavOpen(!navOpen)}
            >
              <span className="sr-only">Open menu</span>
              <AiOutlineMenu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-10">
            <a href="#hero" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Platform
            </a>
            <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900">
              About us
            </a>
            <a href="#join-us" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Contact
            </a>
          </nav>

          {/* Desktop Sign In / Sign Up */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <a
              href="/signin"
              className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#F38120] hover:bg-[#e0701c]"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Items */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-gray-200 shadow-lg rounded-b-lg overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#hero"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-300"
              >
                Platform
              </a>
              <a
                href="#features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-300"
              >
                About us
              </a>
              <a
                href="#join-us"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-300"
              >
                Contact
              </a>
            </div>

            <div className="px-5 py-4 border-t border-gray-300">
              <a
                href="/signin"
                className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-[#F38120] bg-gray-100 hover:bg-gray-200"
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#F38120] hover:bg-[#e0701c] mt-3"
              >
                Sign up
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: isExpanded ? 1.05 : 1,
      transition: { duration: 0.3 },
    });
  }, [isExpanded, controls]);

  return (
    <motion.div
      className="bg-[#686D76] bg-opacity-50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      animate={controls}
    >
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <motion.div
              className="w-12 h-12 bg-[#F38120] rounded-full flex items-center justify-center mr-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {React.cloneElement(icon, { className: 'text-white w-6 h-6' })}
            </motion.div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown className="text-[#F38120] w-5 h-5" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-200"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulate loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <LoadingPage />;

  // Calculate opacity for hero image
  const opacity = 1 - Math.min(scrollY / (window.innerHeight * 0.5), 1);

  return (
    <div className="landing-page bg-gray-100 min-h-screen text-gray-800">
      {/* Triangular Pattern Background */}
      <TriangleBackground />

      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative pt-20 pb-32 flex content-center items-center justify-center min-h-screen"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center">
            {/* Hero Text */}
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <motion.h1
                className="text-5xl font-semibold leading-tight mb-6"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                A New Era of{' '}
                <span className="text-[#F38120]">Vehicle Registration</span>
              </motion.h1>

              <motion.p
                className="mt-4 text-lg text-gray-600"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                BlockChain Based Vehcile Registeration System brings blockchain technology
                to revolutionize how we register and manage vehicle information.
              </motion.p>

              {/* Learn More Button */}
              <motion.button
                onClick={() => (window.location.href = '/learn')}
                className="z-10 bg-[#F38120] text-white active:bg-[#e0701c] font-bold uppercase text-base px-8 py-3 rounded-full shadow-md hover:shadow-lg outline-none focus:outline-none mt-8 ease-linear transition-all duration-150 inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Learn More
                <FaArrowRight className="ml-2" />
              </motion.button>

            </div>

            {/* Hero Image */}
            <motion.div
              className="w-full lg:w-6/12 px-4 ml-auto mr-auto"
              style={{ opacity }}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div
                className="h-[400px] relative z-50"
                animate={{
                  y: [0, -20, 0],
                  rotateZ: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src="/herocar.png"
                  alt="Hero Car"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave-like Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="#4A4D52"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-[#4A4D52]">
        <StarryBackground />
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-wrap justify-center text-center mb-16">
            <div className="w-full lg:w-6/12 px-4">
              <motion.h2
                className="text-4xl font-semibold text-[#F38120]"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Our Key Features
              </motion.h2>
              <motion.p
                className="text-lg leading-relaxed m-4 text-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Discover how our innovative system is changing the landscape of
                vehicle registration.
              </motion.p>
            </div>
          </div>

          <div className="flex flex-wrap">
            {/* Feature 1 */}
            <div className="w-full md:w-4/12 px-4 mb-8">
              <FeatureCard
                icon={<FaCheckCircle />}
                title="Enhanced Trust"
                description="With transparent and secure data management, gain the trust of all stakeholders. Our blockchain-based system ensures immutability and traceability of all vehicle registration records."
              />
            </div>

            {/* Feature 2 */}
            <div className="w-full md:w-4/12 px-4 mb-8">
              <FeatureCard
                icon={<FaShieldAlt />}
                title="Reduced Fraud"
                description="Blockchain technology significantly reduces the risk of fraud and data manipulation. Every transaction is cryptographically secured and verified by multiple nodes in the network."
              />
            </div>

            {/* Feature 3 */}
            <div className="w-full md:w-4/12 px-4 mb-8">
              <FeatureCard
                icon={<FaClock />}
                title="Improved Efficiency"
                description="Automated processes and decentralized validation lead to faster and more reliable registration services. Say goodbye to long queues and paperwork — experience the future of vehicle registration."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section id="join-us" className="relative py-20 bg-gray-100">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center">
            {/* Call to Action Text */}
            <div className="w-full md:w-6/12 px-4 mr-auto ml-auto">
              <motion.h3
                className="text-3xl mb-2 font-semibold leading-normal text-[#F38120]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Let's Work Together
              </motion.h3>
              <motion.p
                className="text-lg font-light leading-relaxed mt-4 mb-4 text-gray-600"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Join us in transforming vehicle registration. Sign up today and
                experience the benefits of a secure and efficient system!
              </motion.p>

              <motion.a
                href="/signup"
                className="github-star mt-4 inline-flex items-center text-white font-bold px-6 py-4 rounded-full outline-none focus:outline-none mr-1 mb-1 bg-[#F38120] active:bg-[#e0701c] uppercase text-sm shadow hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Join Now! <FaArrowRight className="ml-2" />
              </motion.a>
            </div>

            {/* Side Image / Cards */}
            <div className="w-full md:w-5/12 px-4 mr-auto ml-auto mt-8 md:mt-0">
              <motion.div
                className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-[#F38120]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  alt="Handshake"
                  src="/handshake.png"
                  className="w-full align-middle rounded-t-lg"
                />
                <div className="relative p-8 mb-4">
                  <h4 className="text-xl font-bold text-white mb-2">
                    Transform the Future
                  </h4>
                  <p className="text-md font-light mb-4 text-white">
                    Be part of the revolution in vehicle registration. Together,
                    we can create a more secure and efficient future.
                  </p>
                  <div className="flex flex-wrap mt-6">
                    <div className="w-full sm:w-4/12 px-4 text-center">
                      <div className="text-white p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
                        <FaUsers className="text-[#F38120]" />
                      </div>
                      <h6 className="text-xl mt-5 font-semibold text-white">
                        Collaborative
                      </h6>
                    </div>
                    <div className="w-full sm:w-4/12 px-4 text-center">
                      <div className="text-white p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
                        <FaLock className="text-[#F38120]" />
                      </div>
                      <h6 className="text-xl mt-5 font-semibold text-white">
                        Secure
                      </h6>
                    </div>
                    <div className="w-full sm:w-4/12 px-4 text-center">
                      <div className="text-white p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
                        <FaRocket className="text-[#F38120]" />
                      </div>
                      <h6 className="text-xl mt-5 font-semibold text-white">
                        Innovative
                      </h6>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 bg-gray-100">
        <div className="container max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-semibold text-[#F38120] text-center mb-6">
            Get in Touch
          </h3>
          {/* Contact Form Component */}
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#4A4D52] pt-8 pb-6">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap text-center lg:text-left">
            <div className="w-full lg:w-6/12 px-4">
              <h4 className="text-3xl font-semibold text-[#F38120]">
                Let's keep in touch!
              </h4>
              <h5 className="text-lg mt-0 mb-2 text-gray-200">
                Find us on any of these platforms, we respond 1-2 business days.
              </h5>
              <div className="mt-6 lg:mb-0 mb-6" />
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="flex flex-wrap items-top mb-6">
                <div className="w-full lg:w-4/12 px-4 ml-auto">
                  <span className="block uppercase text-gray-400 text-sm font-semibold mb-2">
                    Useful Links
                  </span>
                  <ul className="list-unstyled">
                    <li>
                      <a
                        className="text-gray-200 hover:text-white font-semibold block pb-2 text-sm"
                        href="#about-us"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-200 hover:text-white font-semibold block pb-2 text-sm"
                        href="#blog"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-200 hover:text-white font-semibold block pb-2 text-sm"
                        href="#github"
                      >
                        Github
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="w-full lg:w-4/12 px-4">
                  <span className="block uppercase text-gray-400 text-sm font-semibold mb-2">
                    Other Resources
                  </span>
                  <ul className="list-unstyled">
                    <li>
                      <a
                        className="text-gray-200 hover:text-white font-semibold block pb-2 text-sm"
                        href="#terms"
                      >
                        Terms & Conditions
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-200 hover:text-white font-semibold block pb-2 text-sm"
                        href="#privacy"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-200 hover:text-white font-semibold block pb-2 text-sm"
                        href="#contact-us"
                      >
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-500" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center">
              <div className="text-sm text-gray-400 font-semibold py-1">
                Copyright © {new Date().getFullYear()} BlockChain Based Vehicle Registeration System  by{' '}
                <a
                  href="https://www.creative-tim.com?ref=nnjs-footer"
                  className="text-gray-400 hover:text-gray-300"
                >
                  Creative Tim
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
