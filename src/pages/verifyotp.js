import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaArrowRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import LoadingPage from './Loading';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {}; // Get email from state

  // Simulate page load timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if no email exists
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  if (loading) {
    return <LoadingPage />;
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!otp) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'OTP field cannot be empty.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      return;
    }

    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (otp === '123456') {
        Swal.fire({
          title: 'Success!',
          text: 'OTP verified successfully. You can now reset your password.',
          icon: 'success',
          confirmButtonColor: '#F38120',
        }).then(() => {
          navigate('/reset-password', { state: { email } });
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Invalid OTP. Please try again.',
          icon: 'error',
          confirmButtonColor: '#F38120',
        });
      }
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred. Please try again.',
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

        <motion.div
          className="md:w-1/2 bg-[#171717] p-8 rounded-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-[#F38120]">Verify OTP</h2>
          <p className="text-center text-[#F38120] mb-6">
            Enter the OTP sent to <span className="font-semibold">{email}</span>
          </p>
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <InputField
              icon={<FaLock />}
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={setOtp}
            />
            <motion.button
              type="submit"
              className="w-full py-3 px-4 bg-[#F38120] text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-[#e0701c] transition duration-300 ease-in-out transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <span>Verify OTP</span>
                  <FaArrowRight />
                </>
              )}
            </motion.button>
          </form>
          <motion.p
            className="mt-6 text-center text-[#EEEEEE]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Didn't receive an OTP?{' '}
            <a href="/forgot-password" className="text-[#F38120] hover:underline">
              Resend OTP
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#F38120]">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-[#686D76] text-white placeholder-[#F38120] rounded-lg border border-[#F38120] focus:border-[#F38120] focus:ring focus:ring-[#F38120] focus:ring-opacity-50 transition duration-300 ease-in-out"
      />
    </motion.div>
  );
}
