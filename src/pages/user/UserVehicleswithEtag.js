"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaCar,
  FaCalendarAlt,
  FaBarcode,
  FaPalette,
  FaCogs,
  FaIdCard,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaDownload,
  FaFileAlt,
  FaCubes,
  FaSpinner,
} from "react-icons/fa"
import { AuthContext } from "../../context/AuthContext"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Swal from "sweetalert2"

const VehicleCard = ({ vehicle, transactionData, onDownloadPDF, onRegisterBlockchain, isRegistering }) => {
  // Determine if this vehicle has an E-Tag
  const hasEtag = !!vehicle.registrationNumber

  // Find the transaction for this vehicle
  const transaction = transactionData.find((t) => t.vehicleId === vehicle._id || t.vehicleId === vehicle.id)

  // Payment status
  const isPaid = transaction?.PaymentStatus === "Paid"

  // Transaction status
  const isApproved = transaction?.transactionStatus === "Approved"

  // Check if vehicle is already registered on blockchain
  const isOnBlockchain = vehicle.isOnBlockchain

  // E-Tag status message
  const getStatusMessage = () => {
    if (hasEtag) return "E-Tag Generated"
    if (isPaid && !isApproved) return "Payment Completed, Awaiting Approval"
    if (!isPaid) return "Payment Required"
    return "Status Unknown"
  }

  // Status color
  const getStatusColor = () => {
    if (hasEtag) return "bg-green-100 text-green-800 border-green-300"
    if (isPaid && !isApproved) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  // Status icon
  const StatusIcon = () => {
    if (hasEtag) return <FaCheckCircle className="text-green-600" />
    if (isPaid && !isApproved) return <FaSyncAlt className="text-yellow-600" />
    return <FaExclamationTriangle className="text-red-600" />
  }

  // Get user CNIC from localStorage or context
  const getUserCnic = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      return user?.cnic || ""
    } catch (error) {
      console.error("Error getting user CNIC:", error)
      return ""
    }
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden h-full border border-gray-200"
      whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(243, 129, 32, 0.2)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Vehicle Make and Model */}
        <h3 className="text-xl font-bold text-[#4A4D52] mb-2">
          {vehicle.make} {vehicle.model}
        </h3>

        {/* E-Tag Status Banner */}
        <div className={`mb-4 px-3 py-2 rounded-md border flex items-center justify-between ${getStatusColor()}`}>
          <div className="flex items-center">
            <StatusIcon />
            <span className="ml-2 font-medium">{getStatusMessage()}</span>
          </div>
          {hasEtag && (
            <div className="bg-white px-3 py-1 rounded-md border border-green-300 font-bold text-green-800">
              {vehicle.registrationNumber}
            </div>
          )}
        </div>

        {/* Blockchain Status Badge (if applicable) */}
        {isOnBlockchain && (
          <div className="mb-4 px-3 py-2 rounded-md border border-blue-300 bg-blue-50 flex items-center">
            <FaCubes className="text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Registered on Blockchain</span>
          </div>
        )}

        {/* Vehicle Details Grid */}
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Year</h4>
            <div className="flex items-center">
              <FaCalendarAlt className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.year || vehicle.manufactureYear || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Color</h4>
            <div className="flex items-center">
              <FaPalette className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.color || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Engine Number</h4>
            <div className="flex items-center">
              <FaCogs className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.engineNumber || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Chassis Number</h4>
            <div className="flex items-center">
              <FaBarcode className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.chassisNumber || "N/A"}</span>
            </div>
          </div>

          {transaction && (
            <>
              <div className="col-span-2">
                <h4 className="font-semibold text-[#F38120] mb-1">Transaction ID</h4>
                <div className="flex items-center">
                  <FaIdCard className="text-[#F38120] mr-2" />
                  <span className="text-gray-600 font-mono text-sm">{transaction.TransactionId || "N/A"}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[#F38120] mb-1">Payment Status</h4>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.PaymentStatus || "Unknown"}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[#F38120] mb-1">Transaction Status</h4>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {transaction.transactionStatus || "Pending"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap justify-end gap-2">

          {hasEtag && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center text-sm transition-colors"
              onClick={() => {
                Swal.fire({
                  title: "E-Tag Certificate",
                  html: `
                    <div class="bg-gray-100 p-4 rounded-lg text-center">
                      <h3 class="text-xl font-bold mb-2">Registration Number</h3>
                      <div class="bg-white p-3 rounded-md border border-green-300 inline-block">
                        <span class="font-bold text-xl">${vehicle.registrationNumber}</span>
                      </div>
                      <p class="mt-4 text-sm text-gray-600">This E-Tag is officially registered in the system.</p>
                    </div>
                  `,
                  icon: "success",
                  confirmButtonColor: "#F38120",
                })
              }}
            >
              <FaFileAlt className="mr-1.5" />
              View E-Tag
            </button>
          )}
         
        </div>
      </div>
    </motion.div>
  )
}

const UserVehiclesWithEtag = () => {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // all, etag, pending, unpaid
  const [registeringVehicle, setRegisteringVehicle] = useState(null) // Track which vehicle is being registered

  // Get token and decode userId
  const token = localStorage.getItem("token")
  let userId = null
  let isAuthenticated = false
  let userCnic = ""

  try {
    if (token) {
      const decoded = jwtDecode(token)
      userId = decoded?.userId
      isAuthenticated = !!userId

      // Try to get user CNIC from localStorage
      const user = JSON.parse(localStorage.getItem("user"))
      userCnic = user?.cnic || ""
    } else {
      console.error("No token found in localStorage")
      isAuthenticated = false
    }
  } catch (error) {
    console.error("Error decoding token:", error)
    isAuthenticated = false
  }

  useEffect(() => {
    if (!token || !isAuthenticated) {
      Swal.fire({
        title: "Authentication Error",
        text: "Your session has expired or is invalid. Please sign in again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      }).then(() => {
        logout()
        navigate("/signin")
      })
      return
    }

    fetchData()
  }, [userId, token])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch user's vehicles
      const vehiclesResponse = await axios.get(
        `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicles/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Fetch all transactions using the transactions endpoint with filters
      const transactionsResponse = await axios.get(
        `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            fromUserId: userId, // Filter by the current user
          },
        },
      )

      // Check blockchain status for each vehicle with E-Tag
      const vehiclesData = vehiclesResponse.data || []

      // For vehicles with E-Tags, check if they're on the blockchain
      // This is a mock implementation - in a real app, you'd check with your blockchain API
      for (let i = 0; i < vehiclesData.length; i++) {
        if (vehiclesData[i].registrationNumber) {
          try {
            // Check if this vehicle is on the blockchain
            const blockchainResponse = await axios.get(
              `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/blockchain/details`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                params: {
                  registrationNo: vehiclesData[i].registrationNumber,
                },
              },
            )

            // If we get a successful response, the vehicle is on the blockchain
            vehiclesData[i].isOnBlockchain = !!blockchainResponse.data
          } catch (error) {
            // If there's an error or no data returned, the vehicle is not on the blockchain
            vehiclesData[i].isOnBlockchain = false
          }
        }
      }

      console.log("Vehicles data:", vehiclesData)
      console.log("Transactions data:", transactionsResponse.data)

      setVehicles(vehiclesData)
      setTransactions(transactionsResponse.data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load your vehicles. Please try again.")
      Swal.fire("Error", "Failed to fetch your vehicles", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const refreshData = () => {
    fetchData()
  }

  const handleDownloadPDF = async (transactionId) => {
    try {
      Swal.fire({
        title: "Generating PDF",
        text: "Please wait while we generate your receipt...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Call the API to generate the transaction PDF
      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/generateTransactionPDF",
        {
          transactionId: transactionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer", // Changed to arraybuffer for base64 conversion
        },
      )

      // Convert ArrayBuffer to Base64
      const base64String = arrayBufferToBase64(response.data)

      // Create a download link with the base64 data
      downloadBase64AsPDF(base64String, `transaction-${transactionId}.pdf`)

      Swal.fire({
        icon: "success",
        title: "PDF Generated",
        text: "Your transaction receipt has been downloaded.",
        confirmButtonColor: "#F38120",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to generate the transaction receipt. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    }
  }

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = ""
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    return btoa(binary)
  }

  // Helper function to download a Base64 string as a PDF file
  const downloadBase64AsPDF = (base64String, filename) => {
    const link = document.createElement("a")
    link.href = `data:application/pdf;base64,${base64String}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRegisterOnBlockchain = async (vehicle) => {
    // Make sure we have all required data
    if (!vehicle.registrationNumber || !vehicle.chassisNumber || !vehicle.engineNumber || !userCnic) {
      Swal.fire({
        title: "Missing Information",
        text: "Registration number, chassis number, engine number, and your CNIC are required for blockchain registration.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
      return
    }

    // Find the transaction for this vehicle to get payment intent ID
    const transaction = transactions.find((t) => t.vehicleId === vehicle._id || t.vehicleId === vehicle.id)
    const paymentIntentId = transaction?.paymentIntentId || "unknown_payment"

    try {
      setRegisteringVehicle(vehicle._id)

      Swal.fire({
        title: "Registering on Blockchain",
        text: "Please wait while we register your vehicle on the blockchain...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Call the blockchain registration API
      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/blockchain/registerBC",
        {
          chassisNo: vehicle.chassisNumber,
          engineNo: vehicle.engineNumber,
          ownerCnic: userCnic,
          paymentIntentId: paymentIntentId,
          registrationNo: vehicle.registrationNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Update the vehicle's blockchain status in our local state
      const updatedVehicles = vehicles.map((v) => {
        if (v._id === vehicle._id) {
          return { ...v, isOnBlockchain: true }
        }
        return v
      })
      setVehicles(updatedVehicles)

      Swal.fire({
        title: "Registration Successful",
        html: `
          <div class="text-center">
            <p class="mb-4">Your vehicle has been successfully registered on the blockchain.</p>
            <div class="bg-gray-100 p-3 rounded-lg text-left">
              <p class="text-sm mb-1"><strong>Transaction Hash:</strong></p>
              <p class="font-mono text-xs break-all">${response.data.txHash}</p>
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#F38120",
      })
    } catch (error) {
      console.error("Error registering on blockchain:", error)
      Swal.fire({
        title: "Registration Failed",
        text: error.response?.data?.msg || "Failed to register your vehicle on the blockchain. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setRegisteringVehicle(null)
    }
  }

  // Filter vehicles based on search term and filter status
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.engineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    // Status filter
    if (filterStatus === "all") return true

    // Find transaction for this vehicle
    const transaction = transactions.find((t) => t.vehicleId === vehicle._id || t.vehicleId === vehicle.id)

    if (filterStatus === "etag") {
      return !!vehicle.registrationNumber
    }

    if (filterStatus === "pending") {
      return transaction?.PaymentStatus === "Paid" && transaction?.transactionStatus !== "Approved"
    }

    if (filterStatus === "unpaid") {
      return !transaction || transaction.PaymentStatus !== "Paid"
    }

    return true
  })

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
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-[#F38120]">My Vehicles & E-Tags</h1>

                <div className="flex gap-2">
                  <button
                    onClick={refreshData}
                    className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                    disabled={loading}
                  >
                    <FaSyncAlt className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        Swal.fire({
                          title: "Generating PDF",
                          text: "Please wait while we generate your report...",
                          allowOutsideClick: false,
                          didOpen: () => {
                            Swal.showLoading()
                          },
                        })

                        // Call the API to generate all transactions PDF
                        const response = await axios.get(
                          "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/generateAllTransactionsPDF",
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            params: {
                              userId: userId, // Filter by the current user
                            },
                            responseType: "arraybuffer", // Changed to arraybuffer for base64 conversion
                          },
                        )

                        // Convert ArrayBuffer to Base64
                        const base64String = arrayBufferToBase64(response.data)

                        // Create a download link with the base64 data
                        downloadBase64AsPDF(base64String, "all-transactions.pdf")

                        Swal.fire({
                          icon: "success",
                          title: "PDF Generated",
                          text: "Your transactions report has been downloaded.",
                          confirmButtonColor: "#F38120",
                        })
                      } catch (error) {
                        console.error("Error generating PDF:", error)
                        Swal.fire({
                          title: "Error",
                          text: "Failed to generate the transactions report. Please try again.",
                          icon: "error",
                          confirmButtonColor: "#F38120",
                        })
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  >
                    <FaFileAlt className="mr-2" />
                    All Transactions
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                View all your registered vehicles and check their E-Tag status. Vehicles with completed payments will
                have E-Tags generated after approval. You can also register your vehicles on the blockchain for enhanced
                security.
              </p>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search by make, model, chassis number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="etag">E-Tag Generated</option>
                    <option value="pending">Awaiting Approval</option>
                    <option value="unpaid">Payment Required</option>
                  </select>
                </div>
              </div>

              {/* Status Legend */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Status Legend:</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">E-Tag Generated</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Payment Completed, Awaiting Approval</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Payment Required</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Registered on Blockchain</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vehicles Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-[#F38120] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={refreshData}
                  className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <FaCar className="text-gray-400 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No vehicles found</p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "You don't have any registered vehicles yet"}
                </p>
                {searchTerm || filterStatus !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setFilterStatus("all")
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/user-vehicle-register")}
                    className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Register a Vehicle
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                >
                  {filteredVehicles.map((vehicle) => (
                    <motion.div
                      key={vehicle._id || vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VehicleCard
                        vehicle={vehicle}
                        transactionData={transactions}
                        onDownloadPDF={handleDownloadPDF}
                        onRegisterBlockchain={handleRegisterOnBlockchain}
                        isRegistering={registeringVehicle}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserVehiclesWithEtag
