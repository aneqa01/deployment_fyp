import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaCalendarAlt, FaBarcode, FaPalette, FaCogs, FaIdCard } from 'react-icons/fa';
import {AuthContext} from '../context/AuthContext';
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';
import axios from 'axios';
import { jwtDecode } from "jwt-decode"; 


const VehicleCard = ({ vehicle }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden h-full"
      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(243, 129, 32, 0.3)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-[#4A4D52] mb-4">{vehicle.make} {vehicle.model}</h3>
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Year</h4>
            <div className="flex items-center">
              <FaCalendarAlt className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.manufactureYear}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Color</h4>
            <div className="flex items-center">
              <FaPalette className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.color}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">License Plate</h4>
            <div className="flex items-center">
              <FaIdCard className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.licensePlate}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Engine Number</h4>
            <div className="flex items-center">
              <FaCogs className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.engineNumber}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Chassis Number</h4>
            <div className="flex items-center">
              <FaBarcode className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.chassisNumber}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Registration Date</h4>
            <div className="flex items-center">
              <FaCar className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{new Date(vehicle.registrationDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



const UserMyVehicles = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [apiData, setApiData] = useState(() => {
    // Retrieve data from localStorage, if available
    const savedData = localStorage.getItem('userVehicles');
    return savedData ? JSON.parse(savedData) : [];
  });

  // Fallback vehicles for testing purposes
  const fallbackVehicles = [
    {
      id: 1,
      make: 'Toyota',
      model: 'Corolla',
      registrationDate: '2023-01-01',
      engineNumber: 'EN123456',
      licensePlate: 'ABC-1234',
      color: 'Blue',
      chassisNumber: 'CH123456',
      manufactureYear: 2022,
    },
    {
      id: 2,
      make: 'Honda',
      model: 'Civic',
      registrationDate: '2023-02-01',
      engineNumber: 'EN654321',
      licensePlate: 'DEF-5678',
      color: 'Red',
      chassisNumber: 'CH654321',
      manufactureYear: 2021,
    },
    // other vehicles...
  ];

  // const toggleNav = () => {
  //   setNavOpen(!navOpen);
  // };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const storedToken = localStorage.getItem('token');
  console.log("Token: ", storedToken);
  const decoded = jwtDecode(storedToken);
  console.log("Decoded Token: ", decoded);
  const loggedInUserId = decoded.userId;

  console.log("User id above if else:", loggedInUserId);

  useEffect(() => {
    console.log("Inside in UseEffect")
    const fetchUserVehicles = async () => {
      console.log("Inside further useEffect about to")
      if (loggedInUserId) {
        try {
          console.log("Inside If block of fetch",loggedInUserId);
          const response = await axios.get(`http://localhost:8085/api/vehicles/user/${loggedInUserId}`);
          console.log(response.data); // Logging fetched vehicles

          // Store the API response in both vehicles and apiData state
          setVehicles(response.data.length > 0 ? response.data : fallbackVehicles);
          setApiData(response.data.length > 0 ? response.data : fallbackVehicles);

          // Store the data in localStorage so it persists across page refreshes
          localStorage.setItem('userVehicles', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching user vehicles:', error);
          setVehicles(fallbackVehicles); // Fallback in case of error
          setApiData(fallbackVehicles);
        }
      }
      else {
        console.log("Api not hit and not fetch")
        setVehicles(fallbackVehicles); // Fallback in case of error
        setApiData(fallbackVehicles);
      }
    };
    
    fetchUserVehicles();
    // Fetch data only if it's not already in localStorage
    // if (apiData.length === 0) {
    //   fetchUserVehicles();
    // }
    const timer = setTimeout(() => {
      // Optional animation logic if needed
    }, 3000);

    return () => clearTimeout(timer);
  },); // The effect depends on the user state and apiData

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
          {/* Corrected Title Heading */}
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-4xl font-bold text-[#F38120] text-center">
                My Vehicles
              </h1>
            </motion.div>

            <AnimatePresence>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <motion.div
                      key={vehicle._id || vehicle.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <VehicleCard vehicle={vehicle} />
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-[#373A40] text-center col-span-full text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    You do not own any vehicles.
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

export default UserMyVehicles;
