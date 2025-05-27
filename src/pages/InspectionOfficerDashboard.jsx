// src/pages/InspectionOfficerDashboard.jsx
import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClipboardCheck,
  FaExchangeAlt,          // ← new icon import
  FaChevronRight,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import SideNavBar  from "../components/SideNavBar";
import TopNavBar   from "../components/TopNavBar";
import UserProfile from "../components/UserProfile";

const FeatureCard = ({ icon, title, description, onClick }) => (
  <motion.div
    className="bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-lg overflow-hidden cursor-pointer h-48 flex flex-col"
    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(243, 129, 32, 0.3)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
  >
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center mb-4">
        <motion.div
          className="w-12 h-12 bg-gradient-to-r from-[#F38120] to-[#F3A620] rounded-full flex items-center justify-center mr-4 flex-shrink-0"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {React.cloneElement(icon, { className: "text-white w-6 h-6" })}
        </motion.div>
        <h3 className="text-xl font-bold text-[#4A4D52] leading-tight">{title}</h3>
      </div>
      {description && (
        <p className="text-gray-600 flex-1 text-sm leading-relaxed">{description}</p>
      )}
      <motion.div
        className="mt-4 flex justify-end"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <FaChevronRight className="text-[#F38120] w-5 h-5" />
      </motion.div>
    </div>
  </motion.div>
);

const InspectionOfficerDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const userRole = user?.role || "";

  // Guard
  if (!user || userRole !== "InspectionOfficer") {
    navigate(user ? "/unauthorized" : "/signin");
    return null;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={() => { logout(); navigate("/signin"); }}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen((v) => !v)}
          userRole={userRole}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <motion.h1
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620]"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Inspection Officer Dashboard
            </motion.h1>
            <motion.button
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F38120] to-[#F3A620] flex items-center justify-center text-white shadow-lg"
              onClick={() => setProfileOpen((v) => !v)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(243, 129, 32, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUser className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Two Cards: Requests + E-Tag Transfer */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              {/* Inspection Requests */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
              >
                <FeatureCard
                  icon={<FaClipboardCheck />}
                  title="Inspection Requests"
                  description="View and manage your assigned inspection requests."
                  onClick={() => navigate("/inspect-request")}
                />
              </motion.div>

              {/* E-Tag Transfer */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FeatureCard
                  icon={<FaExchangeAlt />}
                  title="E-Tag Transfer"
                  description="Transfer e-tags between vehicles."
                  onClick={() => navigate("/etag-transfer")}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {profileOpen && <UserProfile user={user} onClose={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default InspectionOfficerDashboard;
