import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import SideNavBar from "../components/SideNavBar";
import TopNavBar from "../components/TopNavBar";
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaPhone, FaHome } from "react-icons/fa";

// Reusable Input Field Component
const InputField = ({ icon: Icon, label, name, type, value, onChange, required, placeholder }) => (
  <motion.div className="mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <motion.div className="relative rounded-lg shadow-lg overflow-hidden" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {Icon && <Icon className="text-[#F38120] w-4 h-4" />}
      </div>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        className="block w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-[#F38120] focus:border-[#F38120] transition-all duration-300 bg-[#EEEEEE] bg-opacity-50 backdrop-blur-none"
        placeholder={placeholder || label}
        value={value}
        onChange={onChange}
      />
    </motion.div>
  </motion.div>
);

const EditProfile = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    UserId: "",
    Name: "",
    Email: "",
    Password: "",
    cnic: "",
    PhoneNumber: "",
    AddressDetails: "",
  });

  const [originalPassword, setOriginalPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId;
        if (userId) {
          setFormData((prevState) => ({ ...prevState, UserId: userId }));
          axios
            .get(`https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              const userData = response.data;
              setFormData({
                UserId: userId,
                Name: userData.name,
                Email: userData.email,
                cnic: userData.cnic,
                PhoneNumber: userData.phoneNumber,
                AddressDetails: userData.addressDetails,
              });
              setOriginalPassword(userData.password);
            })
            .catch((err) => {
              console.error("Error fetching user details:", err);
              setError("Failed to load user data.");
            });
        } else {
          setError("User ID not found in token.");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Invalid token. Please log in again.");
      }
    } else {
      setError("Token is missing. Please log in again.");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const updatedFormData = {
      ...formData,
      Password: formData.Password.trim() ? formData.Password : originalPassword,
    };

    try {
      await axios.put("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/updateUser", updatedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update profile.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar logout={handleLogout} navOpen={sidebarOpen} toggleNav={() => setSidebarOpen(!sidebarOpen)} userRole="user" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-5 flex flex-col">
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] text-center">
              Edit Profile
            </h1>
          </motion.div>
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-2xl rounded-2xl p-6 max-w-7xl mx-auto flex-grow flex flex-col justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-4">
              <InputField icon={FaUser} label="Name" name="Name" type="text" value={formData.Name} onChange={handleChange} required />
              <InputField icon={FaEnvelope} label="Email" name="Email" type="email" value={formData.Email} onChange={handleChange} required />
              <InputField icon={FaLock} label="Password" name="Password" type="password" value={formData.Password} onChange={handleChange} placeholder="Leave blank to keep current password" />
              <InputField icon={FaIdCard} label="CNIC" name="cnic" type="text" value={formData.cnic} onChange={handleChange} required />
              <InputField icon={FaPhone} label="Phone Number" name="PhoneNumber" type="text" value={formData.PhoneNumber} onChange={handleChange} required />
              <InputField icon={FaHome} label="Address" name="AddressDetails" type="text" value={formData.AddressDetails} onChange={handleChange} required />
            </div>
          </motion.form>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;
