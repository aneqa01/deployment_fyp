import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaIdCard, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';
import axios from 'axios'; // Import axios for API calls
import { jwtDecode } from 'jwt-decode';

// TransferForm Component
const TransferForm = ({ onSubmit, formData, setFormData }) => {
  return (
    <motion.form
      onSubmit={onSubmit}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 flex flex-col">
        <h3 className="text-2xl font-bold text-[#4A4D52] mb-6">Transfer Vehicle Ownership</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fees" className="font-semibold text-[#F38120] mb-1 block">Fees</label>
            <div className="flex items-center">
              <FaMoneyBillWave className="text-[#F38120] mr-2" />
              <input
                type="number"
                id="fees"
                name="fees"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#F38120] focus:border-[#F38120]"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="cnic" className="font-semibold text-[#F38120] mb-1 block">CNIC <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <FaIdCard className="text-[#F38120] mr-2" />
              <input
                type="text"
                id="cnic"
                name="cnic"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#F38120] focus:border-[#F38120]"
                required
              />
            </div>
          </div>
        </div>
        <motion.button
          type="submit"
          className="mt-6 px-6 py-2 bg-[#F38120] text-white rounded-md hover:bg-[#DC5F00] transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaExchangeAlt className="mr-2" />
          Submit Transfer Request
        </motion.button>
      </div>
    </motion.form>
  );
};

const UserTransferTo = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { vehicleId } = useParams(); // Get vehicleId from the URL
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    cnic: '',
    fees: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const storedToken = localStorage.getItem('token');
  console.log("Token: ", storedToken);
  const decoded = jwtDecode(storedToken);
  const loggedInUserId = decoded.userId;

  console.log(loggedInUserId, formData.cnic, formData.fees, vehicleId);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cnic || !formData.fees) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      // Make API request to transfer ownership
      const response = await axios.post('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transferOwnership', {
        vehicleId,
        currentOwnerId: loggedInUserId,
        newOwnerCnic: formData.cnic,
        transferFee: formData.fees,
      });

      setSuccessMessage(response.data.msg);
      console.log('Transfer request submitted successfully:', response.data.msg);
      setTimeout(() => {
        navigate('/user-dashboard'); // Redirect after success
      }, 2000); // Redirect after a delay
    } catch (error) {
      console.error('Error transferring ownership:', error.response?.data?.msg || error.message);
      setErrorMessage(error.response?.data?.msg || 'Failed to submit transfer request.');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Top Navigation Bar */}
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation Bar */}
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="user"
        />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-4xl font-bold text-[#F38120] text-center">
                Transfer Vehicle Ownership
              </h1>
              {vehicleId && (
                <p className="text-center text-[#4A4D52] mt-2">
                  Vehicle ID: {vehicleId}
                </p>
              )}
            </motion.div>

            {successMessage && (
              <motion.p
                className="text-green-500 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {successMessage}
              </motion.p>
            )}
            {errorMessage && (
              <motion.p
                className="text-red-500 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {errorMessage}
              </motion.p>
            )}

            <AnimatePresence>
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <TransferForm
                  onSubmit={handleSubmit}
                  formData={formData}
                  setFormData={setFormData}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserTransferTo;
