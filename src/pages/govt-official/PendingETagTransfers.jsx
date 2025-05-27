"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import axios from "axios"
import {
  FaExchangeAlt,
  FaEye,
  FaSearch,
  FaFileAlt,
  FaSpinner,
  FaCar,
  FaUser,
  FaCalendarAlt,
  FaClipboardCheck,
} from "react-icons/fa"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"
import { jwtDecode } from "jwt-decode"

const PendingEtagTransfers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingTransfers, setPendingTransfers] = useState([])
  const [filteredTransfers, setFilteredTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedTransfer, setExpandedTransfer] = useState(null)
  const [sendingInspection, setSendingInspection] = useState({})
  const navigate = useNavigate()

  // JWT decode kar ke user info nikalna
  const token = localStorage.getItem("token")
  let currentUser = null
  let isAuthenticated = false

  try {
    if (token) {
      currentUser = jwtDecode(token)
      isAuthenticated = !!currentUser?.userId
      console.log("Current user from JWT:", currentUser)
    } else {
      console.error("No token found in localStorage")
      isAuthenticated = false
    }
  } catch (error) {
    console.error("Error decoding JWT token:", error)
    isAuthenticated = false
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user") // Clear user data bhi
    navigate("/signin")
  }

  // Authentication check useEffect
  useEffect(() => {
    if (!token || !isAuthenticated) {
      Swal.fire({
        title: "Authentication Error",
        text: "Your session has expired or is invalid. Please sign in again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      }).then(() => {
        handleLogout()
      })
      return
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingEtagTransfers()
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Filter transfers based on search term
    if (!searchTerm) {
      setFilteredTransfers(pendingTransfers)
    } else {
      const filtered = pendingTransfers.filter(
        (transfer) =>
          transfer.TransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transfer.fromCnic?.includes(searchTerm) ||
          transfer.toCnic?.includes(searchTerm) ||
          transfer.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transfer.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transfer.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredTransfers(filtered)
    }
  }, [searchTerm, pendingTransfers])

  const fetchPendingEtagTransfers = async () => {
    if (!token || !isAuthenticated) {
      console.error("No valid token for API request")
      return
    }

    try {
      setLoading(true)
      console.log("Fetching pending E-Tag transfers for user:", currentUser?.userId)

      // Fetch pending E-Tag transfers with JWT token
      const response = await axios.get("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions", {
        params: {
          transactionStatus: "PendingApproval",
          transactionType: "EtagTransfer",
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Pending E-Tag transfers response:", response.data)
      setPendingTransfers(response.data || [])
      setFilteredTransfers(response.data || [])
    } catch (error) {
      console.error("Error fetching pending E-Tag transfers:", error)

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please sign in again.",
          icon: "error",
          confirmButtonColor: "#F38120",
        }).then(() => {
          handleLogout()
        })
        return
      }

      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to fetch pending E-Tag transfers",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendForInspection = async (transferId) => {
    if (!token || !isAuthenticated) {
      Swal.fire({
        title: "Authentication Error",
        text: "Please sign in again to continue.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
      return
    }

    try {
      setSendingInspection((prev) => ({ ...prev, [transferId]: true }))

      const result = await Swal.fire({
        title: "Send for Inspection",
        text: "Are you sure you want to send this E-Tag transfer for inspection?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#F38120",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, Send for Inspection",
        cancelButtonText: "Cancel",
      })

      if (!result.isConfirmed) {
        setSendingInspection((prev) => ({ ...prev, [transferId]: false }))
        return
      }

      console.log("Sending inspection request by user:", currentUser?.userId)

      // Call the send-inspection-request API with proper headers
      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-inspection-request",
        {
          transactionId: transferId,
          requestType: "EtagTransfer",
          requestedBy: currentUser?.userId, // JWT se user ID
          requestedByName: currentUser?.name || currentUser?.username, // User name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      Swal.fire({
        title: "Inspection Request Sent!",
        text: "The E-Tag transfer has been successfully sent for inspection.",
        icon: "success",
        confirmButtonColor: "#F38120",
      })

      // Refresh the data
      fetchPendingEtagTransfers()
    } catch (error) {
      console.error("Error sending for inspection:", error)

      // Check for authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please sign in again.",
          icon: "error",
          confirmButtonColor: "#F38120",
        }).then(() => {
          handleLogout()
        })
        return
      }

      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to send for inspection. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setSendingInspection((prev) => ({ ...prev, [transferId]: false }))
    }
  }

  const handleViewDetails = (transferId) => {
    setExpandedTransfer(expandedTransfer === transferId ? null : transferId)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="admin"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-[#F38120] flex items-center">
                    <FaExchangeAlt className="mr-3" />
                    Pending E-Tag Transfers
                  </h1>
                  <p className="text-gray-600 mt-2">Review and manage pending E-Tag transfer requests</p>
                  {currentUser && (
                    <p className="text-sm text-gray-500 mt-1">
                      Logged in as: {currentUser.name || currentUser.username || currentUser.email} (ID:{" "}
                      {currentUser.userId})
                    </p>
                  )}
                </div>
                <motion.button
                  onClick={fetchPendingEtagTransfers}
                  className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSpinner className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </motion.button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search by Transaction ID, CNIC, Vehicle Make/Model, or Registration Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <FaExchangeAlt className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredTransfers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <FaClipboardCheck className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Ready for Inspection</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredTransfers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FaFileAlt className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Requests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {
                          filteredTransfers.filter((t) => {
                            const today = new Date().toDateString()
                            const transferDate = new Date(t.timestamp).toDateString()
                            return today === transferDate
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transfers List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-[#F38120] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <FaExchangeAlt className="text-gray-400 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No pending E-Tag transfers found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? "Try adjusting your search criteria" : "All E-Tag transfers have been processed"}
                </p>
              </div>
            ) : (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {filteredTransfers.map((transfer) => (
                  <motion.div
                    key={transfer.TransactionId}
                    className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-bold text-[#4A4D52] mr-3">
                              Transaction ID: {transfer.TransactionId}
                            </h3>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                              Pending Approval
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 flex items-center">
                                <FaCar className="mr-2 text-[#F38120]" />
                                Vehicle
                              </p>
                              <p className="font-semibold">
                                {transfer.make} {transfer.model}
                              </p>
                              {transfer.registrationNumber && (
                                <p className="text-sm text-gray-500">E-Tag: {transfer.registrationNumber}</p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 flex items-center">
                                <FaUser className="mr-2 text-[#F38120]" />
                                From Owner
                              </p>
                              <p className="font-semibold">CNIC: {transfer.fromCnic}</p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 flex items-center">
                                <FaUser className="mr-2 text-[#F38120]" />
                                To Owner
                              </p>
                              <p className="font-semibold">CNIC: {transfer.toCnic}</p>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-[#F38120]" />
                            <span>Requested: {formatDate(transfer.timestamp)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <motion.button
                            onClick={() => handleViewDetails(transfer.TransactionId)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaEye className="mr-2" />
                            {expandedTransfer === transfer.TransactionId ? "Hide" : "View"} Details
                          </motion.button>

                          <motion.button
                            onClick={() => handleSendForInspection(transfer.TransactionId)}
                            disabled={sendingInspection[transfer.TransactionId]}
                            className="bg-[#F38120] hover:bg-[#e67818] text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            whileHover={!sendingInspection[transfer.TransactionId] ? { scale: 1.05 } : {}}
                            whileTap={!sendingInspection[transfer.TransactionId] ? { scale: 0.95 } : {}}
                          >
                            {sendingInspection[transfer.TransactionId] ? (
                              <>
                                <FaSpinner className="animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <FaClipboardCheck className="mr-2" />
                                Send for Inspection
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedTransfer === transfer.TransactionId && (
                          <motion.div
                            className="mt-6 pt-6 border-t border-gray-200"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="text-lg font-semibold mb-4 text-[#4A4D52]">Complete Transfer Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Transaction Type</p>
                                <p className="font-medium">{transfer.transactionType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Current Status</p>
                                <p className="font-medium">{transfer.transactionStatus}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Request Date</p>
                                <p className="font-medium">{formatDate(transfer.timestamp)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Vehicle Make</p>
                                <p className="font-medium">{transfer.make}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Vehicle Model</p>
                                <p className="font-medium">{transfer.model}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Registration Number</p>
                                <p className="font-medium">{transfer.registrationNumber || "Not Available"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">From CNIC</p>
                                <p className="font-medium">{transfer.fromCnic}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">To CNIC</p>
                                <p className="font-medium">{transfer.toCnic}</p>
                              </div>
                              {transfer.approvalDate && (
                                <div>
                                  <p className="text-sm text-gray-600">Approval Date</p>
                                  <p className="font-medium">{formatDate(transfer.approvalDate)}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default PendingEtagTransfers
