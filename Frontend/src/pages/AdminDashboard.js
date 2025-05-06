import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext for user data
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const InspectionOfficerDashboard = () => {
  const { user, logout } = useContext(AuthContext); // Access the logged-in user data and logout function
  const navigate = useNavigate(); // useNavigate for programmatic navigation

  const handleLogout = () => {
    logout(); // Perform logout action from AuthContext
    navigate('/signin'); // Redirect to the Sign-In page after logout
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-[#DC5F00]">👤 InspectionOfficer DASHBOARD</h2>
          <div className="mt-4">
            <p className="text-xl text-gray-700">Name: {user?.name || 'Admin Name'}</p>
            <p className="text-xl text-gray-700">Email: {user?.email || 'admin@example.com'}</p>
          </div>
        </div>

        {/* Admin Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#DC5F00] text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Total number of registered vehicles
          </div>
          <div className="bg-blue-600 text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Number of approved/rejected registration trips
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Number of pending vehicle registrations
          </div>
          <div className="bg-green-600 text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Number of pending ownership transfers
          </div>
          <div className="bg-green-700 text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Number of successful ownership transfers
          </div>
          <div className="bg-green-700 text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Number of active users
          </div>
          <div className="bg-blue-600 text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Number of approved/rejected ownership transfers
          </div>
          <div className="bg-[#DC5F00] text-white p-6 rounded-lg text-center font-bold shadow-lg">
            Total number of registered vehicles
          </div>
        </div>

        {/* Admin Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-teal-400 text-white p-6 rounded-lg text-center font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform">
            Vehicle Registration Management
          </div>
          <div className="bg-orange-500 text-white p-6 rounded-lg text-center font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform">
            User Management
          </div>
          <div className="bg-[#DC5F00] text-white p-6 rounded-lg text-center font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform">
            Ownership Transfer Management
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            className="bg-[#DC5F00] text-white py-2 px-6 rounded-lg hover:bg-black transition duration-300"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionOfficerDashboard;