"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaCalendarAlt,
  FaBarcode,
  FaPalette,
  FaCogs,
  FaIdCard,
  FaCheckCircle,
  FaMoneyBillWave,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa"
import { AuthContext } from "../context/AuthContext"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

const TransferredVehicleCard = ({ transfer, isReceived = false }) => {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg overflow-hidden h-full border-l-4 ${
        isReceived ? "border-blue-500" : "border-green-500"
      }`}
      whileHover={{
        scale: 1.02,
        boxShadow: isReceived ? "0 0 25px rgba(59, 130, 246, 0.3)" : "0 0 25px rgba(34, 197, 94, 0.3)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaCheckCircle className={isReceived ? "text-blue-500 mr-2" : "text-green-500 mr-2"} />
            <span className={`font-semibold ${isReceived ? "text-blue-600" : "text-green-600"}`}>
              {isReceived ? "Received Vehicle" : "Transferred Vehicle"}
            </span>
          </div>
          <span className="text-xs text-gray-500">{new Date(transfer.TransactionDate).toLocaleDateString()}</span>
        </div>

        {/* Vehicle Info */}
        <h3 className="text-xl font-bold text-[#4A4D52] mb-4">
          {transfer.Make} {transfer.Model}
        </h3>

        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Year</h4>
            <div className="flex items-center">
              <FaCalendarAlt className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{transfer.Year || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Color</h4>
            <div className="flex items-center">
              <FaPalette className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{transfer.Color || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Chassis Number</h4>
            <div className="flex items-center">
              <FaBarcode className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{transfer.ChassisNumber}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Engine Number</h4>
            <div className="flex items-center">
              <FaCogs className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{transfer.EngineNumber}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">
              {isReceived ? "Previous Owner CNIC" : "New Owner CNIC"}
            </h4>
            <div className="flex items-center">
              <FaIdCard className="text-[#F38120] mr-2" />
              <span className="text-gray-600">
                {isReceived ? transfer.PreviousOwnerCnic || "N/A" : transfer.NewOwnerCnic}
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Transfer Fee</h4>
            <div className="flex items-center">
              <FaMoneyBillWave className="text-[#F38120] mr-2" />
              <span className="text-gray-600">PKR {transfer.TransferFee}</span>
            </div>
          </div>
        </div>

        {/* Transfer Details */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="text-gray-700 font-mono text-xs">{transfer.TransactionId}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">Transfer Date:</span>
            <span className="text-gray-700">
              {new Date(transfer.TransactionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const UserTransferredVehicles = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transferredVehicles, setTransferredVehicles] = useState([])
  const [receivedVehicles, setReceivedVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transferred") // "transferred" or "received"

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const storedToken = localStorage.getItem("token")
  const decoded = jwtDecode(storedToken)
  const loggedInUserId = decoded.userId

  useEffect(() => {
    const fetchTransferData = async () => {
      try {
        setLoading(true)

        // Fetch all approved ownership transfer transactions
        const response = await axios.get(
          "http://localhost:8085/api/getTransactions?transactionStatus=Approved&transactionType=OwnershipTransfer",
        )

        // Filter transactions where the current user was the previous owner (transferred by user)
        const userTransfers = response.data.filter((transaction) => transaction.fromUserId === loggedInUserId)

        // Filter transactions where the current user is the new owner (received by user)
        const userReceived = response.data.filter((transaction) => transaction.toUserId === loggedInUserId)

        setTransferredVehicles(userTransfers)
        setReceivedVehicles(userReceived)
      } catch (error) {
        console.error("Error fetching transfer data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransferData()
  }, [loggedInUserId])

  const currentData = activeTab === "transferred" ? transferredVehicles : receivedVehicles
  const currentCount = currentData.length

  if (loading) {
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
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F38120] mx-auto mb-4"></div>
              <div className="text-xl text-[#F38120]">Loading transfer history...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Top Navigation Bar */}
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation Bar */}
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="user"
        />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-4xl font-bold text-[#F38120] text-center">Vehicle Transfer History</h1>
              <p className="text-center text-gray-600 mt-2">Track vehicles you've transferred and received</p>
            </motion.div>

            {/* Toggle Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <div className="bg-white rounded-lg shadow-lg p-1 flex">
                <button
                  onClick={() => setActiveTab("transferred")}
                  className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 flex items-center ${
                    activeTab === "transferred"
                      ? "bg-[#F38120] text-white shadow-md"
                      : "text-gray-600 hover:text-[#F38120]"
                  }`}
                >
                  <FaArrowRight className="mr-2" />
                  Transferred by Me ({transferredVehicles.length})
                </button>
                <button
                  onClick={() => setActiveTab("received")}
                  className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 flex items-center ${
                    activeTab === "received"
                      ? "bg-[#F38120] text-white shadow-md"
                      : "text-gray-600 hover:text-[#F38120]"
                  }`}
                >
                  <FaArrowLeft className="mr-2" />
                  Received by Me ({receivedVehicles.length})
                </button>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-lg shadow-lg p-6 mb-8 ${
                activeTab === "transferred"
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              }`}
            >
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeTab === "transferred" ? "Total Vehicles Transferred" : "Total Vehicles Received"}
                  </h3>
                  <p className="text-3xl font-bold">{currentCount}</p>
                </div>
                {activeTab === "transferred" ? (
                  <FaArrowRight className="text-4xl opacity-80" />
                ) : (
                  <FaArrowLeft className="text-4xl opacity-80" />
                )}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, x: activeTab === "transferred" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "transferred" ? 20 : -20 }}
                transition={{ duration: 0.3, staggerChildren: 0.1 }}
              >
                {currentData.length > 0 ? (
                  currentData.map((transfer, index) => (
                    <motion.div
                      key={transfer.TransactionId}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <TransferredVehicleCard transfer={transfer} isReceived={activeTab === "received"} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {activeTab === "transferred" ? (
                      <FaArrowRight className="text-6xl text-gray-300 mx-auto mb-4" />
                    ) : (
                      <FaArrowLeft className="text-6xl text-gray-300 mx-auto mb-4" />
                    )}
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      {activeTab === "transferred" ? "No Vehicles Transferred" : "No Vehicles Received"}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {activeTab === "transferred"
                        ? "You haven't transferred any vehicles yet."
                        : "You haven't received any vehicles yet."}
                    </p>
                    {activeTab === "transferred" && (
                      <motion.button
                        onClick={() => navigate("/user-ownership-transfer")}
                        className="px-6 py-3 bg-[#F38120] text-white rounded-lg hover:bg-[#DC5F00] transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Transfer a Vehicle
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            {(transferredVehicles.length > 0 || receivedVehicles.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 text-center"
              >
                <motion.button
                  onClick={() => navigate("/user-ownership-transfer")}
                  className="px-6 py-3 bg-[#F38120] text-white rounded-lg hover:bg-[#DC5F00] transition-colors mr-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Transfer Another Vehicle
                </motion.button>
                <motion.button
                  onClick={() => navigate("/user-dashboard")}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Dashboard
                </motion.button>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserTransferredVehicles
