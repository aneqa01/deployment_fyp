// src/pages/EtagTransfer.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SideNavBar from "../components/SideNavBar";
import TopNavBar  from "../components/TopNavBar";
import { AuthContext } from "../context/AuthContext";

const EtagTransfer = () => {
  const { logout, user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in or wrong role
  useEffect(() => {
    if (!user || user.role !== "InspectionOfficer") {
      // if user exists but wrong role → unauthorized
      navigate(user ? "/unauthorized" : "/signin");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Top nav */}
      <TopNavBar toggleNav={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Side nav */}
        <SideNavBar
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen((v) => !v)}
          userRole="InspectionOfficer"
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <motion.h1
            className="text-4xl font-bold text-[#F38120] text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
             E-Tag Transfer
          </motion.h1>

          {/* TODO: build out your E-Tag transfer UI here */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600">
              Here you can implement your e-tag transfer form or table. 
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EtagTransfer;
