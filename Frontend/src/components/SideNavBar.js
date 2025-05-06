import React from 'react';
import { motion } from 'framer-motion';
import {
  FaSignOutAlt,
  FaUserCircle,
  FaKey,
  FaClipboardList,
  FaListAlt,
  FaCarAlt,
  FaTools,
  FaWrench,
  FaUserEdit,
  FaEdit,
  FaDotCircle,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const SideNavBar = ({ logout, navOpen, userRole }) => {
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F38120',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `rgba(0,0,0,0.4)`,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/signin');
        Swal.fire({
          title: 'Logged out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonColor: '#F38120',
        });
      }
    });
  };

 
  const navLinks = [
    {
      role: 'user',
      links: [
        { path: '/user-dashboard', label: 'Dashboard', icon: <FaListAlt /> },
        { path: '/edit-profile', label: 'Profile Change', icon: <FaUserEdit /> },
        { path: '/change-password', label: 'Password', icon: <FaKey /> },
        

       
      ],
    },
    {
      role: 'governmentOfficial',
      links: [
        { path: '/government-official-dashboard', label: 'Dashboard', icon: <FaListAlt /> },
        { path: '/audit-logs', label: 'Audit Logs', icon: <FaClipboardList /> },
        { path: '/govt-change-password', label: 'Change Password', icon: <FaKey /> },
        { path: '/vehicle-registry', label: 'Vehicle Registry', icon: <FaCarAlt /> },
        { path: '/edit-govt', label: 'Edit Profile', icon: <FaEdit /> },

      ],
    },
    {
      role: 'InspectionOfficer',
      links: [
        { path: '/inspector-dashboard', label: 'Dashboard', icon: <FaWrench /> },
        { path: '/inspect-request', label: 'request', icon: <FaTools /> },
        {path: '/vehicle-details/:vehicleId', label: 'Vehicle Details', icon: <FaCarAlt />},
        
      ],
    },
  ];

  // Filter links for the current userRole
  const filteredLinks = navLinks.find((item) => item.role === userRole)?.links || [];

  // Sidebar Animation Variants
  const sidebarVariants = {
    open: {
      width: '16rem',
      transition: { duration: 0.3 },
    },
    closed: {
      width: '4rem',
      transition: { duration: 0.3 },
    },
  };

  const linkVariants = {
    open: {
      opacity: 1,
      x: 0,
      display: 'flex',
      transition: { duration: 0.2 },
    },
    closed: {
      opacity: 0,
      x: -20,
      display: 'none',
      transition: { duration: 0.2 },
    },
  };

  // Icon container variants for the circular gradient backgrounds
  const iconContainerVariants = {
    open: { scale: 1, transition: { duration: 0.3 } },
    closed: { scale: 0.8, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-[#4A4D52] to-[#3A3D42] shadow-lg flex flex-col justify-between"
      initial="closed"
      animate={navOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
    >
      {/* Navigation Links */}
      <nav className="mt-8 space-y-4">
        {filteredLinks.map((link) => (
          <motion.div
            key={link.path}
            className="flex items-center px-4 py-2 text-white transition-colors duration-200 rounded-l-full hover:bg-[#F38120]"
            whileHover={{ x: 5 }}
          >
            <Link to={link.path} className="flex items-center w-full">
              {/* Circular gradient icon container */}
              <motion.div
                className="p-2 rounded-full bg-gradient-to-r from-[#F38120] to-[#F3A620] mr-2"
                variants={iconContainerVariants}
              >
                {link.icon}
              </motion.div>
              <motion.span className="ml-1" variants={linkVariants}>
                {link.label}
              </motion.span>
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mb-8">
        <motion.button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 text-white hover:bg-[#F38120] transition-colors duration-200 rounded-l-full"
          whileHover={{ x: 5 }}
        >
          {/* Circular gradient icon container for logout */}
          <motion.div
            className="p-2 rounded-full bg-gradient-to-r from-[#F38120] to-[#F3A620] mr-2"
            variants={iconContainerVariants}
          >
            <FaSignOutAlt className="w-5 h-5" />
          </motion.div>
          <motion.span className="ml-1" variants={linkVariants}>
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SideNavBar;
