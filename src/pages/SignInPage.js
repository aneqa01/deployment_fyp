import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import LoadingPage from './Loading';

export default function SignInPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'Both email and password fields are required.',
        icon: 'error',
        confirmButtonColor: '#F38120',
      });
      return;
    }

    try {
      const user = await login(email, password);
      setIsLoading(false);

      Swal.fire({
        title: '<h2 class="text-[#F38120] text-2xl font-bold">Login Successful</h2>',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 border-t-4 border-[#F38120] border-opacity-75 rounded-full animate-spin mb-4"></div>
            <p class="text-white text-lg">Welcome, ${user.role}! Redirecting to your dashboard...</p>
          </div>
        `,
        showConfirmButton: false,
        background: '#171717',
        color: '#EEEEEE',
        timer: 2000,
        willClose: () => {
          if (user.role === 'InspectionOfficer') {
            navigate('/inspector-dashboard');
          } else if (user.role === 'government official') {
            navigate('/government-official-dashboard');
          } else {
            navigate('/user-dashboard');
          }
        },
      });
    } catch (err) {
      setIsLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'Invalid email or password',
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
          <h1 className="text-4xl font-bold text-[#F38120] mb-2">BlockChain Based Vehicle Registeration System</h1>
          <p className="text-[#F38120] text-center mb-8">Secure your future with blockchain technology</p>
          <motion.div 
            className="w-full h-1 bg-[#F38120]"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.div
          className="md:w-1/2 bg-[#171717] p-8 rounded-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-[#F38120]">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              icon={<FaEnvelope />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            <InputField
              icon={<FaLock />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              isPassword
            />
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-[#F38120] text-sm hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
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
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <span>Sign In</span>
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
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F38120] hover:underline">
              Sign Up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange, isPassword = false }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

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
        type={isPassword && isPasswordVisible ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 bg-[#686D76] text-white placeholder-[#F38120] rounded-lg border border-[#F38120] focus:border-[#F38120] focus:ring focus:ring-[#F38120] focus:ring-opacity-50 transition duration-300 ease-in-out"
      />
      {isPassword && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#F38120] focus:outline-none"
        >
          {isPasswordVisible ? '🙈' : '👁️'}
        </button>
      )}
    </motion.div>
  );
}
