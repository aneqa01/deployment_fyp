import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaHome } from 'react-icons/fa';

const TopNavBar = ({ toggleNav }) => {
  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <motion.div
      className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-4 bg-gradient-to-r from-[#4A4D52] to-[#3A3D42] shadow-md"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-4">
        <motion.button
          onClick={toggleNav}
          className="p-2 rounded-md text-[#F38120] hover:bg-[#F38120] hover:text-white transition-colors duration-200"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaBars />
        </motion.button>
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src="/sc.png" 
            alt="Secure Chain Logo" 
            className="h-8 w-auto"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          />
          <motion.span 
            className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Secure Chain
          </motion.span>
        </motion.div>
      </div>
      <motion.div
        className="flex items-center space-x-4 text-white"
        whileHover={{ scale: 1.05 }}
      >
        <motion.span
          className="cursor-pointer flex items-center"
           onClick={goToHomePage}
          whileHover={{ color: '#F38120' }}
          whileTap={{ scale: 0.95 }}
        >
          <FaHome className="mr-2" />
          Home
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default TopNavBar;