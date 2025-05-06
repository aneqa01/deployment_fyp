// File: LoadingPage.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TriangleBackground = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="triangles"
        width="50"
        height="43.3"
        patternUnits="userSpaceOnUse"
        patternTransform="scale(2)"
      >
        <path
          d="M25 0 L50 43.3 L0 43.3 Z"
          fill="none"
          stroke="#F38120"
          strokeOpacity="0.1"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#triangles)" />
    </svg>
  );
};

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster and smoother progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval); // Stop progress at 100%
          return 100;
        }
        return prev + 5; // Increment by 5 for smoother animations
      });
    }, 50); // Faster update interval (50ms)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#EEEEEE] text-black overflow-hidden">
      {/* Triangle Background */}
      <TriangleBackground />

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Loading Text */}
        <h1 className="text-4xl font-bold text-black tracking-wide">Loading...</h1>

        {/* Bouncing Balls */}
        <div className="flex space-x-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-black rounded-full"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            ></motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-sm text-white">
        © 2024 SecureChain. All Rights Reserved.
      </div>
    </div>
  );
};

export default LoadingPage;