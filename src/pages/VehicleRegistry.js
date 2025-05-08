import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';
import { jwtDecode } from 'jwt-decode';

const VehicleListItem = ({ vehicle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.li
      className="bg-white bg-opacity-50 shadow-lg rounded-lg overflow-hidden mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex justify-between items-center cursor-pointer" onClick={toggleDetails}>
        <div>
          <h3 className="font-semibold text-[#373A40]">{vehicle.make} {vehicle.model}</h3>
          <p className="text-[#373A40]">License Plate: {vehicle.registrationNumber}</p>
        </div>
        <motion.button
          className="text-[#373A40] hover:text-gray-900"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="px-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[#373A40]"><strong>Year:</strong> {vehicle.year}</p>
            <p className="text-[#373A40]"><strong>Status:</strong> {vehicle.status}</p>
            <p className="text-[#373A40]"><strong>Chassis Number:</strong> {vehicle.chassisNumber}</p>
            <p className="text-[#373A40]"><strong>Engine Number:</strong> {vehicle.engineNumber}</p>
            <p className="text-[#373A40]"><strong>Color:</strong> {vehicle.color}</p>
            <p className="text-[#373A40]"><strong>Registration Date:</strong> {new Date(vehicle.registrationDate).toLocaleDateString()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const VehicleRegistry = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();




  const storedToken = localStorage.getItem('token')
  const decoded = jwtDecode(storedToken);
  const loggedInUserId = decoded.userId;

  console.log("User id :", loggedInUserId)  
  // Function to fetch registered and approved vehicles data
  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:8085/api/vehicles/registered');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles data:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleLogout = () => {
    navigate('/signin');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="governmentOfficial"
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-100 to-gray-200 py-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] text-center">
              Vehicle Registry
            </h1>
            
          </div>
          <div className="p-6 lg:p-10">
            <motion.div
              className="bg-white bg-opacity-50 shadow-lg rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {vehicles.length > 0 ? (
                <ul>
                  <AnimatePresence>
                    {vehicles.map((vehicle) => (
                      <VehicleListItem key={vehicle._id} vehicle={vehicle} />
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <motion.p
                  className="text-center text-2xl font-semibold text-[#373A40] py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  No registered or approved vehicles available.
                </motion.p>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VehicleRegistry;