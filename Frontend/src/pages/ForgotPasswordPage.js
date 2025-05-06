import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowRight, FaLock } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import LoadingPage from './Loading';

export default function ForgotPasswordPage() {
  const { updateEmail } = useContext(AuthContext); // Access updateEmail function from AuthContext
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verify OTP

  const navigate = useNavigate();

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  // Handle sending OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'Email field is required.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      return;
    }

    try {
      const response = await fetch('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        updateEmail(email); // Save email to context
        setIsLoading(false);
        setStep(2);
        Swal.fire({
          title: 'Success!',
          text: 'OTP has been sent to your email.',
          icon: 'success',
          confirmButtonColor: '#F38120',
        });
      } else {
        setIsLoading(false);
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Email does not exist in the database.',
          icon: 'error',
          confirmButtonColor: '#F38120',
        });
      }
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!otp) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'OTP field is required.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      return;
    }

    try {
      const response = await fetch('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoading(false);
        Swal.fire({
          title: 'Verified!',
          text: 'OTP verified successfully. You can now reset your password.',
          icon: 'success',
          confirmButtonColor: '#F38120',
        }).then(() => {
          navigate('/reset-password'); // Navigate to Reset Password Page
        });
      } else {
        setIsLoading(false);
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Invalid or expired OTP. Please try again.',
          icon: 'error',
          confirmButtonColor: '#F38120',
        });
      }
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
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
          <h2 className="text-3xl font-bold mb-6 text-center text-[#F38120]">
            {step === 1 ? 'Forgot Password' : 'Verify OTP'}
          </h2>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <InputField
                icon={<FaEnvelope />}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
              />
              <SubmitButton isLoading={isLoading} text="Send OTP" />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <InputField
                icon={<FaLock />}
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={setOTP}
              />
              <SubmitButton isLoading={isLoading} text="Verify OTP" />
            </form>
          )}
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
