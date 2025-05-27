

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaIdCard, FaPhone, FaMapMarkerAlt, FaEdit, FaUser, FaCamera } from "react-icons/fa"
import { useNavigate, useLocation } from "react-router-dom"

const UserProfile = ({ user, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location?.state?.successMessage

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Fallback if user is missing
  if (!user) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Message */}
          {successMessage && (
            <motion.div
              className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-3"
              variants={itemVariants}
            >
              <p className="text-green-600 text-center font-semibold text-sm">{successMessage}</p>
            </motion.div>
          )}

          {/* Header Section */}
          <motion.div
            className="bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-t-2xl p-6 relative overflow-hidden"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaUser className="text-white w-5 h-5" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">User Profile</h3>
              </div>
              <motion.button
                onClick={onClose}
                className="text-white hover:text-gray-200 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
          </motion.div>

          <div className="p-6">
            {/* Profile Picture and Basic Info Section */}
            <motion.div className="flex items-center space-x-6 mb-8" variants={itemVariants}>
              <motion.div
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#F38120] to-[#F3A620] p-1">
                  <img
                    src={user.profilePicture || "/c.png"}
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <motion.div
                  className="absolute bottom-0 right-0 w-7 h-7 bg-[#F38120] rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaCamera className="text-white w-3 h-3" />
                </motion.div>
              </motion.div>

              <div className="flex-1">
                <motion.h4 className="text-2xl font-bold text-[#4A4D52] mb-1" variants={itemVariants}>
                  {user.name}
                </motion.h4>
                <motion.p className="text-gray-600 mb-4" variants={itemVariants}>
                  {user.email}
                </motion.p>
                <motion.button
                  onClick={() => navigate("/edit-profile", { state: { user } })}
                  className="flex items-center bg-gradient-to-r from-[#F38120] to-[#F3A620] text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(243, 129, 32, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  <FaEdit className="mr-2 w-3 h-3" />
                  Edit Profile
                </motion.button>
              </div>
            </motion.div>

            {/* User Details Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" variants={itemVariants}>
              <ProfileDetailCard
                icon={<FaIdCard />}
                label="CNIC Number"
                value={user.cnic}
                itemVariants={itemVariants}
              />
              <ProfileDetailCard
                icon={<FaPhone />}
                label="Phone Number"
                value={user.phoneNumber}
                itemVariants={itemVariants}
              />
              <ProfileDetailCard
                icon={<FaMapMarkerAlt />}
                label="Address"
                value={user.addressDetails}
                itemVariants={itemVariants}
              />
            </motion.div>

            {/* Account Information Section */}
            <motion.div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5" variants={itemVariants}>
              <h5 className="text-lg font-semibold text-[#4A4D52] mb-4">Account Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Account Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Member Since:</span>
                  <span className="text-[#4A4D52] font-medium text-sm">January 2024</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Enhanced ProfileDetailCard Component
const ProfileDetailCard = ({ icon, label, value, itemVariants }) => {
  return (
    <motion.div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 4px 20px rgba(243, 129, 32, 0.1)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#F38120] to-[#F3A620] bg-opacity-10 flex items-center justify-center flex-shrink-0"
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(243, 129, 32, 0.15)",
          }}
          transition={{ duration: 0.2 }}
        >
          {React.cloneElement(icon, { className: "text-[#F38120] w-5 h-5" })}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold text-[#4A4D52] break-words">{value || "Not provided"}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default UserProfile
