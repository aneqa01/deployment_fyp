

import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { FaLock, FaShieldAlt, FaExclamationTriangle, FaArrowLeft, FaSignInAlt } from "react-icons/fa"

const RedesignedUnauthorizedPage = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const controls = useAnimation()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    controls.start({
      background: `radial-gradient(circle 400px at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(243,129,32,0.08), transparent 70%)`,
    })
  }, [cursorPosition, controls])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <motion.div className="absolute inset-0 z-0" animate={controls} transition={{ type: "tween", ease: "linear" }} />

      {/* Animated background elements */}
      <div className="absolute inset-0 z-10">
        <div className="floating-shapes" />
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Main content container */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F38120] to-[#F3A620]"></div>

          {/* Lock icon with animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-full flex items-center justify-center shadow-lg">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <FaLock className="text-white text-4xl" />
              </motion.div>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <h1 className="text-5xl font-bold mb-4 text-[#4A4D52] leading-tight">Access Denied</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#F38120] to-[#F3A620] mx-auto mb-6 rounded-full"></div>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-xl text-gray-600 mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            You don't have permission to access this resource. Please contact your administrator or sign in with proper
            credentials.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            <motion.button
              className="flex items-center bg-gradient-to-r from-[#F38120] to-[#F3A620] text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg min-w-[160px]"
              onClick={() => window.history.back()}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(243, 129, 32, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="mr-3" />
              Go Back
            </motion.button>

            <motion.button
              className="flex items-center bg-white border-2 border-[#F38120] text-[#F38120] px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg min-w-[160px] hover:bg-[#F38120] hover:text-white"
              onClick={() => (window.location.href = "/signin")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignInAlt className="mr-3" />
              Sign In
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Status indicators */}
        <motion.div
          className="absolute bottom-8 left-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex items-center text-[#4A4D52]">
            <FaExclamationTriangle className="text-[#F38120] mr-2" />
            <span className="font-semibold">Error Code: 401</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-8 right-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex items-center text-[#4A4D52]">
            <FaShieldAlt className="text-[#F38120] mr-2" />
            <span className="font-semibold">Security Active</span>
          </div>
        </motion.div>

      </div>

      <style jsx>{`
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(243, 129, 32, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(243, 166, 32, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(243, 129, 32, 0.03) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(1deg);
          }
          66% {
            transform: translateY(10px) rotate(-1deg);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #F38120, #F3A620);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #e0701c, #e09a1c);
        }
      `}</style>
    </div>
  )
}

export default RedesignedUnauthorizedPage
