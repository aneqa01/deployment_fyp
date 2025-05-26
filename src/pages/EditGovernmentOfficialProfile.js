import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {jwtDecode} from 'jwt-decode';

const EditGovernmentOfficialProfile = () => {
  const { token, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    UserId: '',
    Name: '',
    Email: '',
    Password: '', // New password or unchanged
    cnic: '',
    PhoneNumber: '',
    AddressDetails: '',
    Department: '',
    Position: '',
    ProfilePicture: '',
  });
  const [originalPassword, setOriginalPassword] = useState(''); // Store the original password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Decode token to retrieve User ID
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        if (userId) {
          setFormData((prevState) => ({
            ...prevState,
            UserId: userId,
          }));

          // Fetch government official details
          axios
            .get(`https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
              const userData = response.data;
              setFormData((prevState) => ({
                ...prevState,
                Name: userData.name,
                Email: userData.email,
                cnic: userData.cnic,
                PhoneNumber: userData.phoneNumber,
                AddressDetails: userData.addressDetails,
                Department: userData.department || '',
                Position: userData.position || '',
                ProfilePicture: userData.profilePicture || '',
              }));
              setOriginalPassword(userData.password); // Store original password
            })
            .catch((err) => {
              console.error('Error fetching user details:', err);
              setError('Failed to load user data.');
            });
        } else {
          setError('User ID not found in token.');
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Invalid token. Please log in again.');
      }
    } else {
      setError('Token is missing. Please log in again.');
    }
  }, [token]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const updatedFormData = {
      ...formData,
      Password: formData.Password.trim() ? formData.Password : originalPassword, // Send original password if left unchanged
    };

    try {
      const response = await axios.put('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/updateUser', updatedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.msg);
      navigate('/government-official-dashboard', {
        state: { successMessage: 'Profile updated successfully!' },
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Government Official Profile</h1>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Email</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Password</label>
            <input
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">CNIC</label>
            <input
              type="text"
              name="cnic"
              value={formData.cnic}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Phone Number</label>
            <input
              type="text"
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Address</label>
            <textarea
              name="AddressDetails"
              value={formData.AddressDetails}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              rows="3"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Department</label>
            <input
              type="text"
              name="Department"
              value={formData.Department}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Position</label>
            <input
              type="text"
              name="Position"
              value={formData.Position}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Profile Picture URL</label>
            <input
              type="text"
              name="ProfilePicture"
              value={formData.ProfilePicture}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Update Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGovernmentOfficialProfile;
