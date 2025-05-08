import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaArrowRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import LoadingPage from './Loading';

export default function ResetPassword() {
  const { email } = useContext(AuthContext); // Extract email from AuthContext
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate page load delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Redirect if email is not available
    if (!email) {
      Swal.fire({
        title: 'Error!',
        text: 'Unauthorized access. Please try again.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      }).then(() => navigate('/forgot-password'));
    }
  }, [email, navigate]);

  if (loading) {
    return <LoadingPage />;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Input validation
    if (!newPassword || !confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Both fields are required.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Call the API to update the password
      const response = await fetch('http://localhost:8085/api/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'Your password has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#F38120',
        }).then(() => {
          navigate('/signin'); // Redirect to Sign-In page
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.msg || 'Failed to update the password. Please try again.',
          icon: 'error',
          confirmButtonColor: '#F38120',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#686D76] text-white">
      <div className="w-full max-w-4xl p-8 flex flex-col md:flex-row bg-[#EEEEEE] rounded-lg shadow-2xl overflow-hidden">
        {/* Left Section */}
        <motion.div
          className="md:w-1/2 flex flex-col justify-center items-center p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/SC.png" alt="SecureChain Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-4xl font-bold text-[#F38120] mb-2">SecureChain</h1>
          <p className="text-[#F38120] text-center mb-8">
            Secure your future with blockchain technology
          </p>
          <motion.div
            className="w-full h-1 bg-[#F38120]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Right Section */}
        <motion.div
          className="md:w-1/2 bg-[#171717] p-8 rounded-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-[#F38120]">Reset Password</h2>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <InputField
              icon={<FaLock />}
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <InputField
              icon={<FaLock />}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            <SubmitButton isLoading={isLoading} text="Update Password" />
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#F38120]">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-[#686D76] text-white placeholder-[#F38120] rounded-lg border border-[#F38120] focus:ring-[#F38120] transition duration-300"
      />
    </div>
  );
}

function SubmitButton({ isLoading, text }) {
  return (
    <motion.button
      type="submit"
      className="w-full py-3 px-4 bg-[#F38120] text-white rounded-lg hover:bg-[#e0701c] transform hover:scale-105 transition"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : text}
    </motion.button>
  );
}
