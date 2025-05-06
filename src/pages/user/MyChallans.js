/* ────────────────────────────────────────────────────────────────────────── */
/*  UserMyChallans.js                                                        */
/* ────────────────────────────────────────────────────────────────────────── */
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaAddressCard,
  FaCar,
  FaBarcode,
  FaPhone,
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import SideNavBar from '../../components/SideNavBar';
import TopNavBar from '../../components/TopNavBar';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

/* -------------------------------------------------------------------------- */
/*  🔸 helper for conditionally rendering one row                             */
/* -------------------------------------------------------------------------- */
const Row = ({ label, icon: Icon, value, isDate }) => {
  if (value === null || value === undefined) return null; // skip missing
  const text = isDate ? new Date(value).toLocaleDateString() : value;
  return (
    <div>
      <h4 className="font-semibold text-[#F38120] mb-1">{label}</h4>
      <div className="flex items-center">
        <Icon className="text-[#F38120] mr-2" />
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  🔸 Challan card                                                           */
/* -------------------------------------------------------------------------- */
const ChallanCard = ({ challan }) => (
  <motion.div
    className="bg-white rounded-lg shadow-lg overflow-hidden h-full"
    whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(243, 129, 32, 0.3)' }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold text-[#4A4D52] mb-4">{challan.ChallanId}</h3>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        <Row label="Amount"        icon={FaMoneyBillWave} value={`$ ${challan.Amount}`} />
        <Row label="Type"          icon={FaIdCard}        value={challan.Type} />
        <Row label="Issue Date"    icon={FaCalendarAlt}   value={challan.IssueDate} isDate />
        <Row label="Due Date"      icon={FaCalendarAlt}   value={challan.DueDate}  isDate />
        <Row
          label="Payment Status"
          icon={challan.PaymentStatus === 'Paid' ? FaCheckCircle : FaTimesCircle}
          value={challan.PaymentStatus}
        />
        <Row label="Vehicle Make"  icon={FaCar}           value={challan.VehicleMake} />
        <Row label="Vehicle Model" icon={FaCar}           value={challan.VehicleModel} />
        <Row label="Chassis Number" icon={FaBarcode}      value={challan.VehicleChassisNumber} />
        <Row label="User Name"     icon={FaUser}          value={challan.UserName} />
        <Row label="CNIC"          icon={FaAddressCard}   value={challan.UserCNIC} />
        <Row label="Phone Number"  icon={FaPhone}         value={challan.UserPhoneNumber} />
      </div>
    </div>
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*  🔸 main component                                                         */
/* -------------------------------------------------------------------------- */
const UserMyChallans = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [challans, setChallans] = useState([]);

  /* ── get userId from stored JWT ────────────────────────────────────────── */
  const token = localStorage.getItem('token');
  let userId = null;
  try {
    userId = jwtDecode(token)?.userId;
  } catch {
    Swal.fire('Error', 'Invalid session. Please sign in again.', 'error');
    logout();
  }

  /* ── fetch challans once ──────────────────────────────────────────────── */
  useEffect(() => {
    const fetchChallans = async () => {
      if (!userId) return;

      try {
        const { data } = await axios.get(
          'https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/challan-details-byUserId',
          {
            params: { userId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChallans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to fetch challans', 'error');
      }
    };
    fetchChallans();
  }, [userId, token]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  /* ── UI ──────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="user"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-4xl font-bold text-[#F38120] text-center">
                My Challans
              </h1>
            </motion.div>

            <AnimatePresence>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {challans.length ? (
                  challans.map((c) => (
                    <motion.div
                      key={c.ChallanId}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ChallanCard challan={c} />
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-[#373A40] text-center col-span-full text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    You do not have any challans.
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserMyChallans;
