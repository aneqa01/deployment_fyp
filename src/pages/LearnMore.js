
import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "react-router-dom"
import {
  FaShieldAlt,
  FaUserLock,
  FaCar,
  FaIdCard,
  FaFileAlt,
  FaExchangeAlt,
  FaArrowRight,
  FaCheckCircle,
  FaRocket,
  FaGlobe,
  FaUsers,
} from "react-icons/fa"

const LearnMorePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden relative">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-full opacity-8 blur-3xl"
          animate={{
            x: mousePosition.x / 10,
            y: mousePosition.y / 10,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ left: "10%", top: "20%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-[#F3A620] to-[#F38120] rounded-full opacity-6 blur-3xl"
          animate={{
            x: -mousePosition.x / 15,
            y: -mousePosition.y / 15,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ right: "10%", bottom: "20%" }}
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute w-32 h-32 bg-gradient-to-br from-[#F38120] to-[#F3A620] rounded-3xl opacity-5 blur-xl"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ left: "70%", top: "30%" }}
        />

        <motion.div
          className="absolute w-24 h-24 bg-gradient-to-br from-[#F3A620] to-[#F38120] rounded-full opacity-4 blur-lg"
          animate={{
            x: [0, 50, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{ left: "20%", bottom: "40%" }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(243, 129, 32, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(243, 129, 32, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Animated particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#F38120] rounded-full opacity-20"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${60 + i * 5}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="bg-white bg-opacity-90 backdrop-blur-lg shadow-lg fixed w-full z-50 border-b border-gray-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#F38120] to-[#F3A620] bg-clip-text text-transparent"
              >
                BlockChain Based Vehicle Registration System
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="bg-gradient-to-r from-[#F38120] to-[#F3A620] text-white px-8 py-3 rounded-full hover:shadow-xl transition-all duration-300 font-semibold flex items-center"
              >
                Back to Home
                <FaArrowRight className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      <main className="container mx-auto px-6 py-24 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero Section */}
          <motion.div className="text-center mb-32" variants={itemVariants}>
            <motion.div
              className="inline-block mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              
            </motion.div>
            <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight" style={{ y, opacity }}>
              <span className="text-[#4A4D52] block">Revolutionizing</span>
              <motion.span
                className="bg-gradient-to-r from-[#F38120] to-[#F3A620] bg-clip-text text-transparent block mt-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                Vehicle Registration
              </motion.span>
            </motion.h1>
            <motion.p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed" variants={itemVariants}>
              Experience the future of vehicle management with blockchain-powered security, lightning-fast processing,
              and unparalleled transparency. Join thousands of satisfied users who've made the switch.
            </motion.p>
            <motion.div className="flex justify-center" variants={itemVariants}>
              <Link to="/signup">
                <motion.button
                  className="bg-gradient-to-r from-[#F38120] to-[#F3A620] text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Today
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div className="grid md:grid-cols-3 gap-8 mb-32" variants={containerVariants}>
            {[
              {
                icon: FaShieldAlt,
                title: "Unbreakable Security",
                description:
                  "Military-grade blockchain encryption ensures your data is tamper-proof and secure forever.",
                color: "from-blue-400 to-blue-600",
              },
              {
                icon: FaRocket,
                title: "Lightning Fast",
                description:
                  "Process registrations in minutes, not days. Our optimized system delivers instant results.",
                color: "from-green-400 to-green-600",
              },
              {
                icon: FaUserLock,
                title: "Privacy First",
                description:
                  "Advanced zero-knowledge proofs protect your identity while maintaining full transparency.",
                color: "from-purple-400 to-purple-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F38120] to-[#F3A620] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  variants={floatingVariants}
                  animate="animate"
                >
                  <feature.icon className="text-white text-2xl" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#4A4D52] mb-4 group-hover:text-[#F38120] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How It Works Section */}
          <motion.section className="mb-32" variants={containerVariants}>
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="text-5xl font-bold text-[#4A4D52] mb-6">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Four simple steps to revolutionize your vehicle registration experience
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants}>
              {[
                {
                  icon: FaCar,
                  title: "Register Vehicle",
                  description: "Enter your vehicle details on our intuitive, secure platform with guided assistance.",
                  step: "01",
                },
                {
                  icon: FaIdCard,
                  title: "Verify Identity",
                  description: "Complete our advanced blockchain-based identity verification in under 2 minutes.",
                  step: "02",
                },
                {
                  icon: FaFileAlt,
                  title: "Receive Certificate",
                  description: "Get your tamper-proof digital certificate instantly with blockchain verification.",
                  step: "03",
                },
                {
                  icon: FaExchangeAlt,
                  title: "Manage Ownership",
                  description: "Transfer ownership seamlessly with smart contracts and automated processing.",
                  step: "04",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-xl text-center group hover:shadow-2xl transition-all duration-500 border border-gray-100"
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className="absolute top-4 right-4 text-6xl font-bold text-[#F38120] opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    {step.step}
                  </div>
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <step.icon className="text-white text-3xl" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#4A4D52] mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Why Choose Section */}
          <motion.section className="mb-32" variants={containerVariants}>
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="text-5xl font-bold text-[#4A4D52] mb-6">Why Choose Our System?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join the revolution with features that set us apart from traditional systems
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-2 gap-8" variants={containerVariants}>
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 p-10 rounded-3xl shadow-xl border border-gray-100"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-2xl font-bold text-[#4A4D52] mb-8 flex items-center">
                  <FaCheckCircle className="text-[#F38120] mr-3" />
                  Key Benefits
                </h3>
                <div className="space-y-6">
                  {[
                    "99.9% uptime with enterprise-grade infrastructure",
                    "10x faster processing than traditional methods",
                    "Zero fraud guarantee with blockchain verification",
                    "24/7 customer support with expert assistance",
                    "Mobile-first design for on-the-go access",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-full mt-3 mr-4 group-hover:scale-150 transition-transform duration-300" />
                      <p className="text-gray-700 leading-relaxed group-hover:text-[#4A4D52] transition-colors duration-300">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-[#F38120] to-[#F3A620] p-10 rounded-3xl shadow-xl text-white relative overflow-hidden"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-black opacity-10" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-8 flex items-center">
                    <FaGlobe className="mr-3" />
                    Global Impact
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <motion.div
                        className="text-4xl font-bold mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        50K+
                      </motion.div>
                      <p className="text-sm opacity-90">Vehicles Registered</p>
                    </div>
                    <div className="text-center">
                      <motion.div
                        className="text-4xl font-bold mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: "spring" }}
                      >
                        25+
                      </motion.div>
                      <p className="text-sm opacity-90">Countries Served</p>
                    </div>
                    <div className="text-center">
                      <motion.div
                        className="text-4xl font-bold mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, type: "spring" }}
                      >
                        99.9%
                      </motion.div>
                      <p className="text-sm opacity-90">Satisfaction Rate</p>
                    </div>
                    <div className="text-center">
                      <motion.div
                        className="text-4xl font-bold mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.1, type: "spring" }}
                      >
                        24/7
                      </motion.div>
                      <p className="text-sm opacity-90">Support Available</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="text-center bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-3xl p-16 text-white relative overflow-hidden"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-black opacity-10" />
            <div className="relative z-10">
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                Ready to Transform Your Experience?
              </motion.h2>
              <motion.p
                className="text-xl mb-10 opacity-90 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Join thousands of satisfied users who've revolutionized their vehicle registration process
              </motion.p>
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/signup">
                  <motion.button
                    className="bg-white text-[#F38120] px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Your Journey
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            className="flex justify-center items-center space-x-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <FaUsers className="text-[#F38120] text-2xl" />
            <span className="text-gray-600">Trusted by 50,000+ users worldwide</span>
          </motion.div>
          <motion.p
            className="text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            &copy; {new Date().getFullYear()} BlockChain Based Vehicle Registration System. All rights reserved.
            Revolutionizing vehicle registration with blockchain technology.
          </motion.p>
        </div>
      </footer>
    </div>
  )
}

export default LearnMorePage
