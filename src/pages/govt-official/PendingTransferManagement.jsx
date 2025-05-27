"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import axios from "axios"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"
import { jwtDecode } from "jwt-decode"

const PendingTransfersManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedTransfer, setExpandedTransfer] = useState(null)
  const [disableHover, setDisableHover] = useState(false)
  const [pendingTransfers, setPendingTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [blockchainLoading, setBlockchainLoading] = useState({})
  const [approvalLoading, setApprovalLoading] = useState({})
  const navigate = useNavigate()

  // Get user info from JWT
  const token = localStorage.getItem("token")
  let currentUser = null
  try {
    currentUser = jwtDecode(token)
  } catch (error) {
    console.error("Invalid token:", error)
    navigate("/signin")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/signin")
  }

  useEffect(() => {
    const fetchPendingTransfers = async () => {
      try {
        setLoading(true)
        const response = await axios.get("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions/pendingtransfers")
        const pendingTransfers = response.data

        // Enrich each transfer with user details and vehicle details
        const enrichedTransfers = await Promise.all(
          pendingTransfers.map(async (transfer) => {
            try {
              // Set initial status
              transfer.status = "Pending"
              transfer.blockchainRegistered = false

              // Fetch from-user details
              const fromUserRes = await axios.get(`https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${transfer.FromUserId}`)
              const fromUserData = fromUserRes.data
              transfer.FromUserCnic = fromUserData.cnic
              transfer.FromUserName = fromUserData.name
              transfer.FromUserEmail = fromUserData.email

              console.log("📋 From User Data:", {
                userId: transfer.FromUserId,
                cnic: fromUserData.cnic,
                name: fromUserData.name,
              })

              // If ToUserId exists, fetch their details as well
              if (transfer.ToUserId) {
                const toUserRes = await axios.get(`https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${transfer.ToUserId}`)
                const toUserData = toUserRes.data
                transfer.ToUserCnic = toUserData.cnic
                transfer.ToUserName = toUserData.name
                transfer.ToUserEmail = toUserData.email

                console.log("📋 To User Data:", {
                  userId: transfer.ToUserId,
                  cnic: toUserData.cnic,
                  name: toUserData.name,
                })
              } else {
                transfer.ToUserCnic = "Pending"
                transfer.ToUserName = "Pending"
                console.log("⚠️ No ToUserId found for transfer:", transfer.TransactionId)
              }

              // Fetch vehicle details to get E-Tag registration number
              try {
                const vehicleRes = await axios.get(
                  `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicleById?vehicleId=${transfer.VehicleId}`,
                )
                const vehicleData = vehicleRes.data

                console.log("🚗 Vehicle Data:", {
                  vehicleId: transfer.VehicleId,
                  registrationNumber: vehicleData.registrationNumber,
                  make: vehicleData.make,
                  model: vehicleData.model,
                })

                // Add vehicle details to transfer object
                transfer.vehicleDetails = {
                  registrationNumber: vehicleData.registrationNumber || "Not Generated",
                  make: vehicleData.make,
                  model: vehicleData.model,
                  year: vehicleData.manufactureYear || vehicleData.year,
                  color: vehicleData.color,
                  chassisNumber: vehicleData.chassisNumber,
                  engineNumber: vehicleData.engineNumber,
                  registrationDate: vehicleData.registrationDate,
                  status: vehicleData.status,
                }

                // Check if vehicle has E-Tag generated
                transfer.hasETag = vehicleData.registrationNumber && vehicleData.registrationNumber !== "Not Generated"

                console.log("✅ E-Tag Status:", {
                  hasETag: transfer.hasETag,
                  registrationNumber: vehicleData.registrationNumber,
                })
              } catch (vehicleError) {
                console.error("❌ Error fetching vehicle details:", vehicleError)
                transfer.vehicleDetails = {
                  registrationNumber: "Error fetching details",
                  make: "Unknown",
                  model: "Unknown",
                  year: "Unknown",
                  color: "Unknown",
                  chassisNumber: "Unknown",
                  engineNumber: "Unknown",
                }
                transfer.hasETag = false
              }

              return transfer
            } catch (error) {
              console.error("Error enriching transfer:", error)
              return null
            }
          }),
        )

        // Filter out any failed transfers
        const validTransfers = enrichedTransfers.filter((transfer) => transfer !== null)
        setPendingTransfers(validTransfers)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching pending transfers:", err)
        setError("Failed to load pending transfers.")
        setLoading(false)
      }
    }

    fetchPendingTransfers()
  }, [])

  const handleViewDetails = (transactionId) => {
    setExpandedTransfer(expandedTransfer === transactionId ? null : transactionId)
    setDisableHover(!disableHover)
  }

  const handleApprove = async (transactionId) => {
    const transfer = pendingTransfers.find((t) => t.TransactionId === transactionId)

    // Check if vehicle has E-Tag
    if (!transfer.hasETag) {
      Swal.fire({
        title: "Cannot Approve Transfer",
        text: "This vehicle does not have an E-Tag registration number. Please ensure the vehicle is properly registered first.",
        icon: "error",
        confirmButtonText: "OK",
      })
      return
    }

    setApprovalLoading((prev) => ({ ...prev, [transactionId]: true }))

    try {
      // Database approval
      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/approveTransfer",
        { transactionId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      Swal.fire({
        title: "Transfer Approved!",
        html: `
          <p>${response.data.msg}</p>
          <p><strong>E-Tag:</strong> ${transfer.vehicleDetails.registrationNumber}</p>
          <p>You can now register this transfer on blockchain.</p>
        `,
        icon: "success",
        confirmButtonText: "OK",
      })

      // Update local state
      setPendingTransfers((prev) =>
        prev.map((t) =>
          t.TransactionId === transactionId ? { ...t, status: "Approved", blockchainRegistered: false } : t,
        ),
      )

      // Send email notifications
      if (transfer) {
        try {
          await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-email", {
            to: transfer.FromUserEmail,
            subject: "Ownership Transfer Approved",
            data: {
              user: transfer.FromUserName,
              action: "ownership transfer",
              vehicle: `${transfer.vehicleDetails.make} ${transfer.vehicleDetails.model}`,
              status: "approved",
            },
          })

          if (transfer.ToUserEmail && transfer.ToUserEmail !== "Pending") {
            await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-email", {
              to: transfer.ToUserEmail,
              subject: "Ownership Transfer Approved",
              data: {
                user: transfer.ToUserName,
                action: "ownership transfer",
                vehicle: `${transfer.vehicleDetails.make} ${transfer.vehicleDetails.model}`,
                status: "approved",
              },
            })
          }
        } catch (emailError) {
          console.error("Error sending email notifications:", emailError)
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.msg || "Failed to approve the transfer.",
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setApprovalLoading((prev) => ({ ...prev, [transactionId]: false }))
    }
  }

  const handleRegisterOnBlockchain = async (transactionId) => {
    const transfer = pendingTransfers.find((t) => t.TransactionId === transactionId)
    if (!transfer || !transfer.hasETag) {
      Swal.fire({
        title: "Cannot Register on Blockchain",
        text: "Vehicle must have a valid E-Tag registration number to register on blockchain.",
        icon: "error",
        confirmButtonText: "OK",
      })
      return
    }

    // Validate required data before proceeding
    if (!transfer.FromUserCnic || !transfer.ToUserCnic || transfer.ToUserCnic === "Pending") {
      Swal.fire({
        title: "Missing Required Data",
        text: "Cannot register on blockchain: Missing CNIC information for from/to users.",
        icon: "error",
        confirmButtonText: "OK",
      })
      return
    }

    if (!transfer.vehicleDetails.registrationNumber || transfer.vehicleDetails.registrationNumber === "Not Generated") {
      Swal.fire({
        title: "Missing E-Tag",
        text: "Cannot register on blockchain: Vehicle does not have a valid E-Tag registration number.",
        icon: "error",
        confirmButtonText: "OK",
      })
      return
    }

    setBlockchainLoading((prev) => ({ ...prev, [transactionId]: true }))

    try {
      // Prepare blockchain data with proper field names
      const blockchainData = {
        registrationNo: transfer.vehicleDetails.registrationNumber, // E-Tag number
        fromCnic: transfer.FromUserCnic, // Current owner CNIC
        toCnic: transfer.ToUserCnic, // New owner CNIC
      }

      console.log("🚀 Registering on blockchain with data:", blockchainData)
      console.log("📋 Transfer details:", {
        transactionId: transfer.TransactionId,
        fromUser: transfer.FromUserName,
        toUser: transfer.ToUserName,
        vehicle: `${transfer.vehicleDetails.make} ${transfer.vehicleDetails.model}`,
        eTag: transfer.vehicleDetails.registrationNumber,
      })

      const blockchainResponse = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/blockchain/transfer-ownership",
        blockchainData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      console.log("✅ Blockchain registration successful:", blockchainResponse.data)

      Swal.fire({
        title: "Successfully Registered on Blockchain!",
        html: `
        <div style="text-align: left;">
          <p><strong>Transfer Details:</strong></p>
          <p><strong>From:</strong> ${transfer.FromUserName} (${transfer.FromUserCnic})</p>
          <p><strong>To:</strong> ${transfer.ToUserName} (${transfer.ToUserCnic})</p>
          <p><strong>Vehicle:</strong> ${transfer.vehicleDetails.make} ${transfer.vehicleDetails.model}</p>
          <p><strong>E-Tag:</strong> ${transfer.vehicleDetails.registrationNumber}</p>
          <hr style="margin: 10px 0;">
          <p><strong>Blockchain Transaction Hash:</strong></p>
          <p style="font-family: monospace; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">${blockchainResponse.data.txHash}</p>
        </div>
      `,
        icon: "success",
        confirmButtonText: "OK",
      })

      setPendingTransfers((prev) =>
        prev.map((t) =>
          t.TransactionId === transactionId
            ? { ...t, blockchainRegistered: true, blockchainTxHash: blockchainResponse.data.txHash }
            : t,
        ),
      )
    } catch (error) {
      console.error("❌ Blockchain registration failed:", error)
      console.error("Error details:", error.response?.data)

      let errorMessage = "Failed to register on blockchain. Please try again."
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      Swal.fire({
        title: "Blockchain Registration Failed",
        html: `
        <div style="text-align: left;">
          <p><strong>Error:</strong> ${errorMessage}</p>
          <hr style="margin: 10px 0;">
          <p><strong>Data being sent:</strong></p>
          <p><strong>Registration No:</strong> ${transfer.vehicleDetails.registrationNumber}</p>
          <p><strong>From CNIC:</strong> ${transfer.FromUserCnic}</p>
          <p><strong>To CNIC:</strong> ${transfer.ToUserCnic}</p>
        </div>
      `,
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setBlockchainLoading((prev) => ({ ...prev, [transactionId]: false }))
    }
  }

  const handleReject = async (transactionId) => {
    setApprovalLoading((prev) => ({ ...prev, [transactionId]: true }))

    try {
      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/rejectTransfer",
        { transactionId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      Swal.fire({
        title: "Transfer Rejected",
        text: response.data.msg,
        icon: "success",
        confirmButtonText: "OK",
      })

      setPendingTransfers((prev) =>
        prev.map((transfer) =>
          transfer.TransactionId === transactionId ? { ...transfer, status: "Rejected" } : transfer,
        ),
      )

      // Send email notifications
      const rejectedTransfer = pendingTransfers.find((t) => t.TransactionId === transactionId)
      if (rejectedTransfer) {
        try {
          await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-email", {
            to: rejectedTransfer.FromUserEmail,
            subject: "Ownership Transfer Rejected",
            data: {
              user: rejectedTransfer.FromUserName,
              action: "ownership transfer",
              vehicle: `${rejectedTransfer.vehicleDetails.make} ${rejectedTransfer.vehicleDetails.model}`,
              status: "rejected",
            },
          })

          if (rejectedTransfer.ToUserEmail && rejectedTransfer.ToUserEmail !== "Pending") {
            await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-email", {
              to: rejectedTransfer.ToUserEmail,
              subject: "Ownership Transfer Rejected",
              data: {
                user: rejectedTransfer.ToUserName,
                action: "ownership transfer",
                vehicle: `${rejectedTransfer.vehicleDetails.make} ${rejectedTransfer.vehicleDetails.model}`,
                status: "rejected",
              },
            })
          }
        } catch (emailError) {
          console.error("Error sending email notifications:", emailError)
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.msg || "Failed to reject the transfer.",
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setApprovalLoading((prev) => ({ ...prev, [transactionId]: false }))
    }
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

        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] text-center">
              Pending Ownership Transfers Management
            </h1>
            <p className="text-center text-gray-600 mt-2">Review and approve pending ownership transfer requests</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTransfers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingTransfers.filter((t) => t.status === "Approved").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On Blockchain</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingTransfers.filter((t) => t.blockchainRegistered).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With E-Tag</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTransfers.filter((t) => t.hasETag).length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F38120] mr-3"></div>
              <p>Loading pending transfers...</p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <motion.ul
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              {pendingTransfers.map((transfer) => (
                <motion.li
                  key={transfer.TransactionId}
                  className="border border-gray-300 p-6 bg-white bg-opacity-90 rounded-lg shadow-lg"
                  whileHover={disableHover ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">From Owner</p>
                          <p className="font-semibold">
                            {transfer.FromUserName}{" "}
                            <span className="text-gray-500">(CNIC: {transfer.FromUserCnic})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">To Owner</p>
                          <p className="font-semibold">
                            {transfer.ToUserName || "Pending"}{" "}
                            {transfer.ToUserCnic && transfer.ToUserCnic !== "Pending" ? (
                              <span className="text-gray-500">(CNIC: {transfer.ToUserCnic})</span>
                            ) : (
                              ""
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Vehicle</p>
                          <p className="font-semibold">
                            {transfer.vehicleDetails.make} {transfer.vehicleDetails.model} (
                            {transfer.vehicleDetails.year})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">E-Tag Registration</p>
                          <p className={`font-semibold ${transfer.hasETag ? "text-green-600" : "text-red-500"}`}>
                            {transfer.vehicleDetails.registrationNumber}
                            {!transfer.hasETag && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                ❌ No E-Tag
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex items-center">
                            <span
                              className={`font-semibold ${transfer.status === "Approved" ? "text-green-600" : "text-yellow-600"}`}
                            >
                              {transfer.status}
                            </span>
                            {transfer.blockchainRegistered && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                🔗 Blockchain
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {transfer.blockchainTxHash && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Blockchain Transaction</p>
                          <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                            {transfer.blockchainTxHash.substring(0, 40)}...
                          </p>
                        </div>
                      )}
                    </div>

                    <motion.button
                      className="bg-[#F38120] text-white px-4 py-2 rounded ml-4"
                      onClick={() => handleViewDetails(transfer.TransactionId)}
                      whileHover={disableHover ? {} : { scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {expandedTransfer === transfer.TransactionId ? "Hide Details" : "View Details"}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {expandedTransfer === transfer.TransactionId && (
                      <motion.div
                        className="mt-6 pt-6 border-t border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold mb-4">Complete Vehicle Details:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-600">Color</p>
                            <p className="font-medium">{transfer.vehicleDetails.color}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Chassis Number</p>
                            <p className="font-medium">{transfer.vehicleDetails.chassisNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Engine Number</p>
                            <p className="font-medium">{transfer.vehicleDetails.engineNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Registration Date</p>
                            <p className="font-medium">
                              {transfer.vehicleDetails.registrationDate
                                ? new Date(transfer.vehicleDetails.registrationDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Transfer Fee</p>
                            <p className="font-medium">PKR {transfer.TransferFee || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Vehicle Status</p>
                            <p className="font-medium">{transfer.vehicleDetails.status}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          {transfer.status === "Pending" && (
                            <>
                              <motion.button
                                className={`px-6 py-2 rounded transition-all ${
                                  transfer.hasETag
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                                }`}
                                onClick={() => handleApprove(transfer.TransactionId)}
                                disabled={!transfer.hasETag || approvalLoading[transfer.TransactionId]}
                                whileHover={disableHover || !transfer.hasETag ? {} : { scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {approvalLoading[transfer.TransactionId] ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Approving...
                                  </div>
                                ) : transfer.hasETag ? (
                                  "✅ Accept Transfer"
                                ) : (
                                  "❌ Cannot Accept (No E-Tag)"
                                )}
                              </motion.button>
                              <motion.button
                                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
                                onClick={() => handleReject(transfer.TransactionId)}
                                disabled={approvalLoading[transfer.TransactionId]}
                                whileHover={disableHover ? {} : { scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {approvalLoading[transfer.TransactionId] ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Rejecting...
                                  </div>
                                ) : (
                                  "❌ Reject Transfer"
                                )}
                              </motion.button>
                            </>
                          )}

                          {transfer.status === "Approved" && !transfer.blockchainRegistered && (
                            <motion.button
                              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all flex items-center"
                              onClick={() => handleRegisterOnBlockchain(transfer.TransactionId)}
                              disabled={blockchainLoading[transfer.TransactionId]}
                              whileHover={disableHover ? {} : { scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {blockchainLoading[transfer.TransactionId] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Registering on Blockchain...
                                </>
                              ) : (
                                <>🔗 Register on Blockchain</>
                              )}
                            </motion.button>
                          )}

                          {transfer.status === "Approved" && transfer.blockchainRegistered && (
                            <div className="px-6 py-2 bg-green-100 text-green-800 rounded flex items-center">
                              ✅ Successfully Registered on Blockchain
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </main>
      </div>
    </div>
  )
}

export default PendingTransfersManagement
