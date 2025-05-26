import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Swal from 'sweetalert2';
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';
import { FaCar, FaPalette, FaCogs, FaBarcode } from 'react-icons/fa';

const InputField = ({ icon, label, name, type, value, onChange, required }) => (
  <motion.div
    className="mb-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <motion.div
      className="relative rounded-lg shadow-lg overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {React.cloneElement(icon, { className: "text-[#F38120] w-6 h-6" })}
      </div>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        className="block w-full pl-12 pr-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-[#F38120] focus:border-[#F38120] transition-all duration-300 bg-[#EEEEEE] bg-opacity-50 backdrop-blur-none"
        placeholder={label}
        value={value}
        onChange={onChange}
      />
    </motion.div>
  </motion.div>
);

export default function UserVehicleRegister() {
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    chassisNumber: '',
    engineNumber: '',
  });

  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setError('You must be logged in to register a vehicle.');
      setIsSubmitting(false);
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(storedToken);
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Invalid token. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    const loggedInUserId = decoded.userId;
    if (!loggedInUserId) {
      setError('Could not find user ID in token. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.make || !formData.model || !formData.year || !formData.chassisNumber || !formData.engineNumber) {
      setError('All fields must be filled out.');
      setIsSubmitting(false);
      return;
    }

    const vehicleData = {
      ownerId: loggedInUserId,
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      color: formData.color || null,
      chassisNumber: formData.chassisNumber,
      engineNumber: formData.engineNumber,
    };

    try {
      // Show loading state
      Swal.fire({
        title: 'Registering Vehicle',
        text: 'Please wait while we process your registration...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Step 1: Register the vehicle
      const response = await axios.post(
        'https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/registerVehicleRequest', 
        vehicleData, 
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        // Extract VehicleId from the nested JSON response
        const vehicleId = response.data.recordset[0].VehicleId;

        // Store the VehicleId in localStorage
        localStorage.setItem('vehicleId', vehicleId);

        // Step 2: Get user email from the backend
        const userResponse = await axios.get(
          `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${loggedInUserId}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        const userEmail = userResponse.data.email;
        const userName = userResponse.data.name || "User";

        // Step 3: Send email notification
        const emailData = {
          to: userEmail,
          subject: "Vehicle Registration in Progress",
          data: {
            user: userName,
            action: "registered a new vehicle",
            vehicle: `${formData.make} ${formData.model} (${formData.year})`,
            status: "Registration in progress. Awaiting government approval."
          }
        };

        await axios.post(
          'https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-email',
          emailData,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        Swal.fire({
          title: 'Vehicle Registered!',
          text: `Your ${formData.make} ${formData.model} has been registered successfully. A confirmation email has been sent to your email address. Waiting for government approval.`,
          icon: 'success',
          confirmButtonText: 'Continue to Document Upload',
          confirmButtonColor: '#F38120',
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to DocumentUpload page
            navigate('/document-upload');
          }
        });
      }
    } catch (error) {
      console.error('Error registering vehicle:', error.response ? error.response.data : error.message);
      Swal.fire({
        title: 'Registration Failed',
        text: 'There was an error registering your vehicle. Please try again.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      setError('There was an error registering the vehicle. Please make sure all fields are filled correctly.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-5 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-[#F38120] text-center">
              Vehicle Registration
            </h1>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-2xl rounded-2xl p-6 max-w-4xl mx-auto flex-grow flex flex-col justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={<FaCar />}
                label="Vehicle Make"
                name="make"
                type="text"
                value={formData.make}
                onChange={handleChange}
                required
              />
              <InputField
                icon={<FaCar />}
                label="Vehicle Model"
                name="model"
                type="text"
                value={formData.model}
                onChange={handleChange}
                required
              />
              <InputField
                icon={<FaCogs />}
                label="Year of Manufacture"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
              />
              <InputField
                icon={<FaPalette />}
                label="Color"
                name="color"
                type="text"
                value={formData.color}
                onChange={handleChange}
              />
              <InputField
                icon={<FaBarcode />}
                label="Chassis Number"
                name="chassisNumber"
                type="text"
                value={formData.chassisNumber}
                onChange={handleChange}
                required
              />
              <InputField
                icon={<FaBarcode />}
                label="Engine Number"
                name="engineNumber"
                type="text"
                value={formData.engineNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
              <p>A confirmation email will be sent to your registered email address once your vehicle registration is submitted.</p>
            </div>

            <motion.div
              className="mt-6 flex justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#F38120] to-[#F3A620] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Register Vehicle"
                )}
              </button>
            </motion.div>
          </motion.form>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
