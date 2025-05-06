import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaIdCard, FaPhone, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const UserProfile = ({ user, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location?.state?.successMessage;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    exit: { y: -20, opacity: 0 },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { type: 'spring', stiffness: 500, damping: 24 } },
    hover: { scale: 1.2, rotate: 360, transition: { duration: 0.3 } },
  };

  // Fallback if user is missing
  if (!user) {
    return <p className="text-red-500">User data not found. Please try again.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-lg w-full p-6 bg-gray-100 rounded-lg shadow-lg space-y-6">
        {/* Success Message */}
        {successMessage && (
          <p className="text-green-500 text-center font-semibold">{successMessage}</p>
        )}

        {/* Profile Card */}
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="p-6 bg-gradient-to-r from-[#F38120] to-[#F3A620]"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">User Profile</h3>
              <motion.button
                onClick={onClose}
                className="text-white hover:text-gray-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes />
              </motion.button>
            </div>
          </motion.div>

          <div className="p-6 space-y-6">
            {/* Profile Picture Section */}
            <motion.div className="flex items-center space-x-4" variants={itemVariants}>
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-r from-[#F38120] to-[#F3A620] flex items-center justify-center"
                variants={iconVariants}
                whileHover="hover"
              >
                <img
                  src={user.profilePicture || '/c.png'} // Fallback to default avatar
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </motion.div>
              <div>
                <motion.h4 className="text-2xl font-semibold" variants={itemVariants}>
                  {user.name}
                </motion.h4>
                <motion.p className="text-gray-400" variants={itemVariants}>
                  {user.email}
                </motion.p>
              </div>
            </motion.div>

            {/* User Details Section */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <ProfileItem
                icon={<FaIdCard />}
                label="CNIC"
                value={user.cnic}
                itemVariants={itemVariants}
                iconVariants={iconVariants}
              />
              <ProfileItem
                icon={<FaPhone />}
                label="Phone"
                value={user.phoneNumber}
                itemVariants={itemVariants}
                iconVariants={iconVariants}
              />
              <ProfileItem
                icon={<FaMapMarkerAlt />}
                label="Address"
                value={user.addressDetails}
                itemVariants={itemVariants}
                iconVariants={iconVariants}
              />
            </motion.div>

            {/* Edit Profile Button */}
            <motion.div className="mt-4 flex justify-center" variants={itemVariants}>
              <motion.button
                onClick={() => navigate('/edit-profile', { state: { user } })}
                className="flex items-center bg-[#F38120] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#e0701c] transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ProfileItem Component for displaying user details
const ProfileItem = ({ icon, label, value, itemVariants, iconVariants }) => {
  return (
    <motion.div className="flex items-center space-x-3" variants={itemVariants}>
      <motion.div
        className="w-10 h-10 rounded-full bg-[#F38120] bg-opacity-20 flex items-center justify-center"
        variants={iconVariants}
        whileHover="hover"
      >
        {React.cloneElement(icon, { className: 'text-[#F38120] w-5 h-5' })}
      </motion.div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-lg">{value}</p>
      </div>
    </motion.div>
  );
};

export default UserProfile;
