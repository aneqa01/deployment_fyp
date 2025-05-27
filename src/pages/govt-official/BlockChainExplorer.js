"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import {
  FaSearch,
  FaCar,
  FaExchangeAlt,
  FaHistory,
  FaIdCard,
  FaCalendarAlt,
  FaUserAlt,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaArrowLeft,
  FaCubes,
} from "react-icons/fa"
import axios from "axios"
import Swal from "sweetalert2"
import { AuthContext } from "../../context/AuthContext"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"

const VehicleCard = ({ vehicle, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-[#4A4D52] mb-2">
          {vehicle.make} {vehicle.model}
        </h3>
        <div
          className={`mb-4 px-3 py-2 rounded-md border flex items-center justify-between ${
            vehicle.registrationNumber
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
        >
          <div className="flex items-center">
            {vehicle.registrationNumber ? (
              <FaCheckCircle className="text-green-600 mr-2" />
            ) : (
              <FaExclamationTriangle className="text-yellow-600 mr-2" />
            )}
            <span className="font-medium">{vehicle.registrationNumber ? "Registered" : "Registration Pending"}</span>
          </div>
          {vehicle.registrationNumber && (
            <div className="bg-white px-3 py-1 rounded-md border border-green-300 font-bold text-green-800">
              {vehicle.registrationNumber}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Year</h4>
            <div className="flex items-center">
              <FaCalendarAlt className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{vehicle.year || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Color</h4>
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: vehicle.color?.toLowerCase() || "#ccc" }}
              ></div>
              <span className="text-gray-600">{vehicle.color || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Engine Number</h4>
            <div className="flex items-center">
              <FaIdCard className="text-[#F38120] mr-2" />
              <span className="text-gray-600 font-mono text-sm">{vehicle.engineNumber || "N/A"}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Chassis Number</h4>
            <div className="flex items-center">
              <FaIdCard className="text-[#F38120] mr-2" />
              <span className="text-gray-600 font-mono text-sm">{vehicle.chassisNumber || "N/A"}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onViewDetails(vehicle)}
            className="bg-[#F38120] hover:bg-[#e67818] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaEye className="mr-2" />
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

const TransactionHistoryItem = ({ transaction, onDownloadPDF }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Unpaid":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={toggleExpand}>
        <div className="flex items-center">
          <div className="bg-[#F38120] bg-opacity-20 p-3 rounded-full mr-4">
            <FaExchangeAlt className="text-[#F38120]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{transaction.transactionType || "Vehicle Registration"}</h3>
            <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium mr-4 ${getStatusColor(
              transaction.transactionStatus,
            )}`}
          >
            {transaction.transactionStatus}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium mr-4 ${getPaymentStatusColor(
              transaction.PaymentStatus,
            )}`}
          >
            {transaction.PaymentStatus || "Unknown"}
          </span>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-[#F38120] mb-2">Transaction Details</h4>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">Transaction ID:</span>{" "}
                <span className="font-mono">{transaction.TransactionId}</span>
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">Type:</span>{" "}
                {transaction.transactionType || "Vehicle Registration"}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">Date:</span> {formatDate(transaction.timestamp)}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">Status:</span> {transaction.transactionStatus}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">Payment Status:</span>{" "}
                {transaction.PaymentStatus || "Unknown"}
              </p>
              {transaction.approvalDate && (
                <p className="text-sm mb-1">
                  <span className="font-medium text-gray-700">Approval Date:</span>{" "}
                  {formatDate(transaction.approvalDate)}
                </p>
              )}
              {transaction.approverId && (
                <p className="text-sm mb-1">
                  <span className="font-medium text-gray-700">Approver ID:</span> {transaction.approverId}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-[#F38120] mb-2">User Details</h4>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">From User:</span> {transaction.fromUserName}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">From User ID:</span>{" "}
                <span className="font-mono">{transaction.fromUserId}</span>
              </p>
              {transaction.toUserName && (
                <p className="text-sm mb-1">
                  <span className="font-medium text-gray-700">To User:</span> {transaction.toUserName}
                </p>
              )}
              {transaction.toUserId && (
                <p className="text-sm mb-1">
                  <span className="font-medium text-gray-700">To User ID:</span>{" "}
                  <span className="font-mono">{transaction.toUserId}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDownloadPDF(transaction.TransactionId)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
            >
              <FaDownload className="mr-2" />
              Download Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const BlockchainExplorer = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortField, setSortField] = useState("make")
  const [sortDirection, setSortDirection] = useState("asc")
  const [blockchainRegisteredNumbers, setBlockchainRegisteredNumbers] = useState([])

  const token = localStorage.getItem("token")
  let userId = null
  let isAuthenticated = false

  try {
    if (token) {
      const decoded = jwtDecode(token)
      userId = decoded?.userId
      isAuthenticated = !!userId
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

    fetchAllVehicles()
    fetchBlockchainRegisteredNumbers()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, searchTerm, filterStatus, sortField, sortDirection])

  const fetchAllVehicles = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data && Array.isArray(response.data)) {
        const vehiclesWithOwners = await Promise.all(
          response.data.map(async (vehicle) => {
            if (vehicle.ownerId) {
              try {
                const userResponse = await axios.get(
                  `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${vehicle.ownerId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                if (userResponse.data && userResponse.data.name) {
                  return { ...vehicle, ownerName: userResponse.data.name }
                }
              } catch (error) {
                console.error(`Error fetching owner for vehicle ${vehicle._id}:`, error)
              }
            }
            return { ...vehicle, ownerName: "Unknown" }
          }),
        )

        setVehicles(vehiclesWithOwners)
        setFilteredVehicles(vehiclesWithOwners)
      } else {
        setError("Failed to fetch vehicles data")
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err)
      setError("Failed to fetch vehicles. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockchainRegisteredNumbers = async () => {
    try {
      const response = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/blockchain/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.data && Array.isArray(response.data.output)) {
        setBlockchainRegisteredNumbers(response.data.output)
      } else {
        setBlockchainRegisteredNumbers([])
      }
    } catch (error) {
      console.error("Error fetching blockchain registered numbers:", error)
      setBlockchainRegisteredNumbers([])
    }
  }

  const applyFiltersAndSort = () => {
    let result = [...vehicles]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.make?.toLowerCase().includes(term) ||
          vehicle.model?.toLowerCase().includes(term) ||
          vehicle.registrationNumber?.toLowerCase().includes(term) ||
          vehicle.chassisNumber?.toLowerCase().includes(term) ||
          vehicle.engineNumber?.toLowerCase().includes(term) ||
          vehicle.ownerName?.toLowerCase().includes(term),
      )
    }

    if (filterStatus !== "all") {
      if (filterStatus === "registered") {
        result = result.filter((vehicle) => !!vehicle.registrationNumber)
      } else if (filterStatus === "pending") {
        result = result.filter((vehicle) => !vehicle.registrationNumber)
      }
    }

    result.sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]

      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })

    setFilteredVehicles(result)
  }

  const handleViewDetails = async (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowVehicleDetails(true)
    setActiveTab("details")

    try {
      const transactionsResponse = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            vehicleId: vehicle._id || vehicle.id,
          },
        },
      )

      if (transactionsResponse.data && Array.isArray(transactionsResponse.data)) {
        const sortedTransactions = [...transactionsResponse.data].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        )
        setTransactionHistory(sortedTransactions)
      } else {
        setTransactionHistory([])
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error)
      setTransactionHistory([])
    }
  }

  const handleBackToList = () => {
    setShowVehicleDetails(false)
    setSelectedVehicle(null)
    setTransactionHistory([])
  }

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
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
          responseType: "blob",
        },
      )

      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `transaction-${transactionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)

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

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const registerVehicleOnBlockchain = async (vehicle) => {
    try {
      Swal.fire({
        title: "Registering Vehicle on Blockchain",
        text: "Please wait while we register this vehicle on the blockchain...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const userResponse = await axios.get(
        `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${vehicle.ownerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!userResponse.data || !userResponse.data.cnic) {
        throw new Error("Could not retrieve owner CNIC")
      }

      const ownerCnic = userResponse.data.cnic
      console.log("Owner CNIC:", ownerCnic)

      const transactionsResponse = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            vehicleId: vehicle._id || vehicle.id,
          },
        },
      )

      let chassisNo = vehicle.chassisNumber
      let engineNo = vehicle.engineNumber
      let paymentIntentId = "unknown"

      if (transactionsResponse.data && Array.isArray(transactionsResponse.data) && transactionsResponse.data.length > 0) {
        const latestTransaction = transactionsResponse.data[0]
        chassisNo = latestTransaction.chassisNumber || vehicle.chassisNumber
        engineNo = latestTransaction.engineNumber || vehicle.engineNumber
        paymentIntentId = latestTransaction.PaymentIntentId || "unknown"
      } else {
        console.warn("No transactions found for this vehicle, using vehicle object data")
      }

      const registrationNo = vehicle.registrationNumber

      const registrationData = {
        chassisNo,
        engineNo,
        ownerCnic,
        paymentIntentId,
        registrationNo,
      }

      console.log("Data prepared for blockchain/registerBC:", registrationData)

      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/blockchain/registerBC",
        registrationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Response from blockchain/registerBC:", response.data)

      if (response.data && response.data.txHash) {
        setSelectedVehicle({
          ...selectedVehicle,
          blockchainRegistered: true,
          blockchainTxHash: response.data.txHash,
        })
        setBlockchainRegisteredNumbers([...blockchainRegisteredNumbers, registrationNo])
        Swal.fire({
          icon: "success",
          title: "Vehicle Registered on Blockchain",
          text: "This vehicle has been successfully registered on the blockchain.",
          confirmButtonColor: "#F38120",
        })
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to register the vehicle on the blockchain. No transaction hash returned.",
          icon: "error",
          confirmButtonColor: "#F38120",
        })
      }
    } catch (error) {
      console.error("Error registering vehicle on blockchain:", error)
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to register the vehicle on the blockchain. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    }
  }

  // Function to handle approving vehicle registration with UI feedback
  const handleApproveRegistration = async (transactionId, approvedBy) => {
    try {
      Swal.fire({
        title: "Approving Registration",
        text: "Please wait while we approve the vehicle registration...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/approveRegistration",
        {
          transactionId,
          approvedBy,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data && response.data.registrationNumber) {
        // Update the vehicle list to reflect the new registration number
        setVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.id === selectedVehicle.id
              ? { ...vehicle, registrationNumber: response.data.registrationNumber }
              : vehicle
          )
        )
        setFilteredVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.id === selectedVehicle.id
              ? { ...vehicle, registrationNumber: response.data.registrationNumber }
              : vehicle
          )
        )
        setSelectedVehicle((prev) => ({
          ...prev,
          registrationNumber: response.data.registrationNumber,
        }))

        Swal.fire({
          icon: "success",
          title: "Registration Approved",
          html: `Vehicle registration approved successfully. E-Tag: <strong>${response.data.registrationNumber}</strong><br>Email notification has been sent to the owner.`,
          confirmButtonColor: "#F38120",
        })
      }
    } catch (error) {
      console.error("Error approving registration:", error)
      Swal.fire({
        title: "Error",
        text: error.response?.data?.msg || "Failed to approve the vehicle registration. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f7fa]">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="government official"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Blockchain Explorer</h1>
              <p className="text-gray-600">
                {showVehicleDetails
                  ? "View vehicle details and transaction history on the blockchain."
                  : "Explore all vehicles and their complete history on the blockchain."}
              </p>
            </div>

            {showVehicleDetails && selectedVehicle ? (
              <>
                <button
                  onClick={handleBackToList}
                  className="mb-6 flex items-center text-[#F38120] hover:text-[#e67818] transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to All Vehicles
                </button>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-[#F38120] to-[#e67818] p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="bg-white p-3 rounded-full mr-4">
                          <FaCar className="text-[#F38120] text-xl" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year || "N/A"})
                          </h2>
                          <p className="text-white text-opacity-90">
                            Registration:{" "}
                            <span className="font-mono">{selectedVehicle.registrationNumber || "Not Registered"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg border border-white border-opacity-30">
                        <p className="text-white text-sm">
                          Current Owner: <span className="font-semibold">{selectedVehicle.ownerName}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      <button
                        className={`py-4 px-6 font-medium text-sm border-b-2 ${
                          activeTab === "details"
                            ? "border-[#F38120] text-[#F38120]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("details")}
                      >
                        <FaInfoCircle className="inline-block mr-2" />
                        Vehicle Details
                      </button>
                      <button
                        className={`py-4 px-6 font-medium text-sm border-b-2 ${
                          activeTab === "history"
                            ? "border-[#F38120] text-[#F38120]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("history")}
                      >
                        <FaHistory className="inline-block mr-2" />
                        Transaction History
                        {transactionHistory.length > 0 && (
                          <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                            {transactionHistory.length}
                          </span>
                        )}
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === "details" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FaCar className="text-[#F38120] mr-2" /> Vehicle Information
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Make</p>
                                <p className="font-medium">{selectedVehicle.make}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Model</p>
                                <p className="font-medium">{selectedVehicle.model}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Year</p>
                                <p className="font-medium">{selectedVehicle.year || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Color</p>
                                <p className="font-medium">{selectedVehicle.color}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Registration Number</p>
                                <p className="font-medium font-mono">
                                  {selectedVehicle.registrationNumber || "Not Registered"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Registration Date</p>
                                <p className="font-medium">
                                  {selectedVehicle.registrationDate
                                    ? new Date(selectedVehicle.registrationDate).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4 flex items-center">
                            <FaIdCard className="text-[#F38120] mr-2" /> Vehicle Identification
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Vehicle ID</p>
                                <p className="font-medium font-mono">{selectedVehicle._id || selectedVehicle.id}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Chassis Number</p>
                                <p className="font-medium font-mono">{selectedVehicle.chassisNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Engine Number</p>
                                <p className="font-medium font-mono">{selectedVehicle.engineNumber}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FaUserAlt className="text-[#F38120] mr-2" /> Current Owner
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Owner Name</p>
                                <p className="font-medium">{selectedVehicle.ownerName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Owner ID</p>
                                <p className="font-medium font-mono">{selectedVehicle.ownerId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Ownership Since</p>
                                <p className="font-medium">
                                  {selectedVehicle.ownershipDate
                                    ? new Date(selectedVehicle.ownershipDate).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4 flex items-center">
                            <FaCalendarAlt className="text-[#F38120] mr-2" /> Registration Status
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center mb-4">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  selectedVehicle.registrationStatus === "Active"
                                    ? "bg-green-500"
                                    : selectedVehicle.registrationStatus === "Pending"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  selectedVehicle.registrationStatus === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : selectedVehicle.registrationStatus === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {selectedVehicle.registrationStatus || "Unknown"}
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">E-Tag Generated</p>
                                <p className="font-medium flex items-center">
                                  {selectedVehicle.registrationNumber ? (
                                    <>
                                      <FaCheckCircle className="text-green-500 mr-2" /> Yes
                                    </>
                                  ) : (
                                    <>
                                      <FaExclamationTriangle className="text-red-500 mr-2" /> No
                                    </>
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p className="font-medium">
                                  {selectedVehicle.updatedAt
                                    ? new Date(selectedVehicle.updatedAt).toLocaleString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            {/* Add Approve Button if the vehicle is not yet registered */}
                            {!selectedVehicle.registrationNumber && (
                              <div className="mt-4">
                                <button
                                  onClick={() => handleApproveRegistration(selectedVehicle.transactionId, userId)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                >
                                  <FaCheckCircle className="mr-2" />
                                  Approve Registration
                                </button>
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4 flex items-center">
                            <FaCubes className="text-[#F38120] mr-2" /> Blockchain Status
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Blockchain Registration</p>
                                <p className="font-medium flex items-center">
                                  {selectedVehicle.blockchainRegistered || blockchainRegisteredNumbers.includes(selectedVehicle.registrationNumber) ? (
                                    <>
                                      <FaCheckCircle className="text-green-500 mr-2" /> Registered
                                    </>
                                  ) : (
                                    <>
                                      <FaExclamationTriangle className="text-yellow-500 mr-2" /> Not Registered
                                    </>
                                  )}
                                </p>
                              </div>
                              {selectedVehicle.blockchainTxHash && (
                                <div>
                                  <p className="text-sm text-gray-500">Transaction Hash</p>
                                  <p className="font-medium font-mono text-xs break-all">
                                    {selectedVehicle.blockchainTxHash}
                                  </p>
                                </div>
                              )}
                              <div className="mt-4">
                                {selectedVehicle.blockchainRegistered || blockchainRegisteredNumbers.includes(selectedVehicle.registrationNumber) ? (
                                  <p className="text-sm text-green-600 font-medium">Already registered on blockchain</p>
                                ) : !selectedVehicle.registrationNumber ? (
                                  <p className="text-sm text-red-600 font-medium">
                                    E-Tag is required before registration on blockchain
                                  </p>
                                ) : (
                                  <button
                                    onClick={() => registerVehicleOnBlockchain(selectedVehicle)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                  >
                                    <FaCubes className="mr-2" />
                                    Register on Blockchain
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <FaHistory className="text-[#F38120] mr-2" /> Transaction History
                        </h3>

                        {transactionHistory.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <FaExchangeAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">No transaction history found</p>
                            <p className="text-gray-400 text-sm">
                              This vehicle has no recorded transactions in the blockchain
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {transactionHistory.map((transaction) => (
                              <TransactionHistoryItem
                                key={transaction.TransactionId}
                                transaction={transaction}
                                onDownloadPDF={handleDownloadPDF}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-grow">
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search Vehicles
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="search"
                          placeholder="Search by make, model, registration number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#F38120] focus:border-[#F38120] transition-colors"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Status
                      </label>
                      <select
                        id="filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#F38120] focus:border-[#F38120] transition-colors"
                      >
                        <option value="all">All Vehicles</option>
                        <option value="registered">Registered Only</option>
                        <option value="pending">Pending Registration</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-500">Sort by:</span>
                    <button
                      onClick={() => handleSort("make")}
                      className={`flex items-center px-3 py-1 rounded ${
                        sortField === "make" ? "bg-[#F38120] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Make
                      {sortField === "make" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSort("model")}
                      className={`flex items-center px-3 py-1 rounded ${
                        sortField === "model"
                          ? "bg-[#F38120] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Model
                      {sortField === "model" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSort("year")}
                      className={`flex items-center px-3 py-1 rounded ${
                        sortField === "year" ? "bg-[#F38120] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Year
                      {sortField === "year" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSort("ownerName")}
                      className={`flex items-center px-3 py-1 rounded ${
                        sortField === "ownerName"
                          ? "bg-[#F38120] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Owner
                      {sortField === "ownerName" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-16 h-16 border-4 border-[#F38120] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vehicles</h3>
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={fetchAllVehicles}
                      className="mt-4 bg-[#F38120] hover:bg-[#e67818] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <FaCar className="text-gray-300 text-5xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vehicles Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm || filterStatus !== "all"
                        ? "No vehicles match your search criteria. Try adjusting your filters."
                        : "There are no vehicles in the system yet."}
                    </p>
                    {(searchTerm || filterStatus !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setFilterStatus("all")
                        }}
                        className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle._id || vehicle.id}
                        vehicle={vehicle}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BlockchainExplorer