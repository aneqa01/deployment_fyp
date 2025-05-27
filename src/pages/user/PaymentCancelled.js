"use client"

import { useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaTimesCircle, FaArrowLeft } from "react-icons/fa"
import { AuthContext } from "../../context/AuthContext"

const PaymentCancelled = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/signin")
      return
    }

    // Clean up any payment session data
    localStorage.removeItem("stripe_session_id")
    localStorage.removeItem("challan_id")
  }, [navigate, isAuthenticated])

  const handleGoBack = () => {
    navigate("/user/challans")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <FaTimesCircle className="text-red-500 text-6xl" />
          </div>

          <h2 className="text-2xl font-bold text-[#4A4D52] mb-4">Payment Cancelled</h2>

          <p className="text-gray-600 mb-6">
            Your challan payment was cancelled. No charges have been made to your account.
          </p>

          <p className="text-sm text-gray-500 mb-8">You can try again when you're ready to complete the payment.</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="bg-[#F38120] text-white py-3 px-6 rounded-lg shadow-md flex items-center justify-center font-semibold mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Return to Challans
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentCancelled
