import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaExchangeAlt, FaCarAlt, FaHistory, FaChevronRight, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';

const FeatureCard = ({ icon, title, description, onClick }) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-lg overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(243, 129, 32, 0.3)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <motion.div
            className="w-12 h-12 bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-full flex items-center justify-center mr-4"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            {React.cloneElement(icon, { className: 'text-white w-6 h-6' })}
          </motion.div>
          <h3 className="text-xl font-bold text-[#4A4D52]">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
        <motion.div 
          className="mt-4 flex justify-end"
          whileHover={{ x: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <FaChevronRight className="text-[#F38120] w-5 h-5" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const GovernmentOfficialDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const userRole = 'governmentOfficial';

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // const unauthorized =()=>{
  //   navigate('/unauthorized');
  // };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole={userRole}
        />
 
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="flex justify-between items-center mb-10">
            <motion.h1
              className="text-4xl  font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] "
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Government Official Dashboard
            </motion.h1>
            <motion.button
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F38120] to-[#F3A620] flex items-center justify-center text-white shadow-lg"
              onClick={toggleProfile}
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(243, 129, 32, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUser className="w-6 h-6" />
            </motion.button>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
              >
                <FeatureCard
                  icon={<FaClipboardList />}
                  title="Pending Registrations"
                  description="View and approve pending vehicle registrations."
                  onClick={() => navigate('/pending-registrations')}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FeatureCard
                  icon={<FaExchangeAlt />}
                  title="Ownership Transfers"
                  description="Manage vehicle ownership transfer approvals."
                  onClick={() => navigate('/ownership-transfers')}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FeatureCard
                  icon={<FaCarAlt />}
                  title="Vehicle Registry"
                  description="View the total registered vehicles with details."
                  onClick={() => navigate('/vehicle-registry')}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <FeatureCard
                  icon={<FaHistory />}
                  title="Audit Logs"
                  description="View transaction history and audit logs."
                  onClick={() => navigate('/audit-logs')}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
      <AnimatePresence>
      
      </AnimatePresence>
    </div>
  );
};

export default GovernmentOfficialDashboard;