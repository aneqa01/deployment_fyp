"use client"

import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaAddressCard,
  FaCar,
  FaBarcode,
  FaPhone,
  FaCreditCard,
} from "react-icons/fa"
import { AuthContext } from "../../context/AuthContext"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Swal from "sweetalert2"

/* -------------------------------------------------------------------------- */
/*  🔸 helper for conditionally rendering one row                             */
/* -------------------------------------------------------------------------- */
const Row = ({ label, icon: Icon, value, isDate }) => {
  if (value === null || value === undefined) return null // skip missing
  const text = isDate ? new Date(value).toLocaleDateString() : value
  return (
    <div>
      <h4 className="font-semibold text-[#F38120] mb-1">{label}</h4>
      <div className="flex items-center">
        <Icon className="text-[#F38120] mr-2" />
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  🔸 Challan card                                                           */
/* -------------------------------------------------------------------------- */
const ChallanCard = ({ challan, onPayNow }) => (
  <motion.div
    className="bg-white rounded-lg shadow-lg overflow-hidden h-full"
    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(243, 129, 32, 0.3)" }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold text-[#4A4D52] mb-4">{challan.ChallanId}</h3>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        <Row label="Amount" icon={FaMoneyBillWave} value={`$ ${challan.Amount}`} />
        <Row label="Type" icon={FaIdCard} value={challan.Type} />
        <Row label="Issue Date" icon={FaCalendarAlt} value={challan.IssueDate} isDate />
        <Row label="Due Date" icon={FaCalendarAlt} value={challan.DueDate} isDate />
        <Row
          label="Payment Status"
          icon={challan.PaymentStatus === "Paid" ? FaCheckCircle : FaTimesCircle}
          value={challan.PaymentStatus}
        />
        <Row label="Vehicle Make" icon={FaCar} value={challan.VehicleMake} />
        <Row label="Vehicle Model" icon={FaCar} value={challan.VehicleModel} />
        <Row label="Chassis Number" icon={FaBarcode} value={challan.VehicleChassisNumber} />
        <Row label="User Name" icon={FaUser} value={challan.UserName} />
        <Row label="CNIC" icon={FaAddressCard} value={challan.UserCNIC} />
        <Row label="Phone Number" icon={FaPhone} value={challan.UserPhoneNumber} />
      </div>

      {/* Payment Button - Only show for Pending challans */}
      {challan.PaymentStatus === "Pending" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 bg-[#F38120] text-white py-3 px-6 rounded-lg shadow-md flex items-center justify-center font-semibold"
          onClick={() => onPayNow(challan)}
        >
          <FaCreditCard className="mr-2" />
          Pay Now
        </motion.button>
      )}
    </div>
  </motion.div>
)

/* -------------------------------------------------------------------------- */
/*  🔸 Payment Processing Modal                                               */
/* -------------------------------------------------------------------------- */
const PaymentModal = ({ isOpen, challan, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-[#4A4D52] mb-4">Confirm Payment</h2>
        <p className="mb-6 text-gray-600">You are about to pay the following challan:</p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-[#F38120]">Challan ID</h4>
              <p className="text-gray-700">{challan?.ChallanId?.substring(0, 8)}...</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#F38120]">Amount</h4>
              <p className="text-gray-700">${challan?.Amount}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#F38120]">Type</h4>
              <p className="text-gray-700">{challan?.Type}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#F38120]">Vehicle</h4>
              <p className="text-gray-700">
                {challan?.VehicleMake} {challan?.VehicleModel}
              </p>
            </div>
          </div>
        </div>

        <p className="mb-6 text-gray-600">You will be redirected to Stripe to complete your payment securely.</p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#F38120] text-white rounded-lg hover:bg-[#e67818] flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FaCreditCard className="mr-2" />
                Proceed to Payment
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  🔸 main component                                                         */
/* -------------------------------------------------------------------------- */
const UserMyChallans = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [challans, setChallans] = useState([])
  const [selectedChallan, setSelectedChallan] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  /* ── get userId from stored JWT ────────────────────────────────────────── */
  const token = localStorage.getItem("token")
  let userId = null
  try {
    userId = jwtDecode(token)?.userId
  } catch {
    Swal.fire("Error", "Invalid session. Please sign in again.", "error")
    logout()
  }

  /* ── fetch challans once ──────────────────────────────────────────────── */
  useEffect(() => {
    const fetchChallans = async () => {
      if (!userId) return

      try {
        const { data } = await axios.get(
          "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/challan-details-byUserId",
          {
            params: { userId },
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setChallans(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        Swal.fire("Error", "Failed to fetch challans", "error")
      }
    }
    fetchChallans()
  }, [userId, token])

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  /* ── Payment Handlers ──────────────────────────────────────────────────── */
  const handlePayNow = (challan) => {
    setSelectedChallan(challan)
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedChallan(null)
  }

  const proceedToPayment = async () => {
    if (!selectedChallan) return

    setIsProcessingPayment(true)
    try {
      console.log("Starting payment process for challan:", selectedChallan.ChallanId)

      // Store challan details in localStorage for receipt generation
      localStorage.setItem("challan_amount", selectedChallan.Amount)
      localStorage.setItem("vehicle_make", selectedChallan.VehicleMake)
      localStorage.setItem("vehicle_model", selectedChallan.VehicleModel)
      localStorage.setItem("chassis_number", selectedChallan.VehicleChassisNumber)
      localStorage.setItem("user_name", selectedChallan.UserName)
      localStorage.setItem("user_cnic", selectedChallan.UserCNIC)
      localStorage.setItem("challan_type", selectedChallan.Type)

      // Debug: Log the challan ID being sent
      console.log("Sending challan ID to server:", selectedChallan.ChallanId)

      // Make the API request with a simple payload
      const response = await axios({
        method: "POST",
        url: "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/stripe/payChallanbyId",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          challanId: selectedChallan.ChallanId,
        },
      })

      console.log("API response received:", response.data)

      if (!response.data || !response.data.url) {
        throw new Error("Invalid response from server: Missing Stripe checkout URL")
      }

      // Store session ID and challan ID in localStorage for verification on return
      localStorage.setItem("stripe_session_id", response.data.sessionId)
      localStorage.setItem("challan_id", selectedChallan.ChallanId)

      // Redirect to Stripe checkout
      window.location.href = response.data.url
    } catch (error) {
      console.error("Payment initialization failed:", error)

      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)

        Swal.fire(
          "Error",
          `Server error: ${error.response.status} - ${error.response.data?.error || error.response.data?.message || "Unknown error"}`,
          "error",
        )
      } else {
        console.error("Error message:", error.message)
        Swal.fire("Error", error.message || "Failed to initialize payment", "error")
      }

      setIsProcessingPayment(false)
      closePaymentModal()
    }
  }

  /* ── UI ──────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="user"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-4xl font-bold text-[#F38120] text-center">My Challans</h1>
            </motion.div>

            <AnimatePresence>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {challans.length ? (
                  challans.map((c) => (
                    <motion.div
                      key={c.ChallanId}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ChallanCard challan={c} onPayNow={handlePayNow} />
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-[#373A40] text-center col-span-full text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    You do not have any challans.
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        challan={selectedChallan}
        onClose={closePaymentModal}
        onConfirm={proceedToPayment}
        isLoading={isProcessingPayment}
      />
    </div>
  )
}

export default UserMyChallans;
