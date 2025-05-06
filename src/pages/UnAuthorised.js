import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const RedesignedUnauthorizedPage = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    controls.start({
      background: `radial-gradient(circle 300px at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(243,129,32,0.15), transparent 80%)`,
    });
  }, [cursorPosition, controls]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden font-mono">
      <motion.div
        className="absolute inset-0 z-0"
        animate={controls}
        transition={{ type: 'tween', ease: 'linear' }}
      />
      
      <div className="absolute inset-0 z-10">
        <div className="grid-background" />
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-5">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-6 glitch-text" data-text="ACCESS DENIED">ACCESS DENIED</h1>
          <p className="text-xl mb-8 cyberpunk-text">AUTHORIZATION REQUIRED: SYSTEM BREACH DETECTED</p>
        </motion.div>

        <motion.div
          className="flex space-x-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <button className="cyberpunk-button" onClick={() => window.history.back()}>
            RETURN
          </button>
          <button className="cyberpunk-button" onClick={() => window.location.href = '/signin'}>
            LOGIN
          </button>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-10 cyberpunk-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          ERROR CODE: 401
        </motion.div>

        <motion.div
          className="absolute top-10 right-10 cyberpunk-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          SECURITY PROTOCOL: ACTIVE
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        .glitch-text {
          position: relative;
          color: #F38120;
          text-shadow: 2px 2px #000000, -1px -1px #4A4D52;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }

        .glitch-text::before {
          left: 2px;
          text-shadow: -1px 0 #000000;
          animation: glitch 2s infinite;
          animation-delay: -1s;
        }

        .glitch-text::after {
          left: -2px;
          text-shadow: -1px 0 #F38120, 1px 1px #000000;
          animation: glitch 2s infinite;
          animation-delay: -0.5s;
        }

        .cyberpunk-text {
          color: #F38120;
          text-shadow: 0 0 5px #F38120, 0 0 10px #F38120;
        }

        .cyberpunk-button {
          background: linear-gradient(45deg, #4A4D52, #F38120);
          border: none;
          color: white;
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cyberpunk-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: all 0.4s ease;
        }

        .cyberpunk-button:hover::before {
          left: 100%;
        }

        .grid-background {
          position: absolute;
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(to right, rgba(243, 129, 32, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(243, 129, 32, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotate(45deg);
          left: -50%;
          top: -50%;
          animation: moveGrid 20s linear infinite;
        }

        @keyframes moveGrid {
          0% {
            transform: rotate(45deg) translateY(0);
          }
          100% {
            transform: rotate(45deg) translateY(-50px);
          }
        }
      `}</style>
    </div>
  );
};

export default RedesignedUnauthorizedPage;
