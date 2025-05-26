"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaCalendarAlt,
  FaFilePdf,
  FaCar,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSync,
  FaTag,
  FaEye,
} from "react-icons/fa"
import axios from "axios"
import Swal from "sweetalert2"
import { AuthContext } from "../../context/AuthContext"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"
import { jwtDecode } from "jwt-decode"

/* =======================================================================
 TRANSACTION LIST ITEM
 ===================================================================== */
const TransactionListItem = ({ transaction, onViewDetails, onGenerateEtag }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleDetails = () => setIsExpanded(!isExpanded)

  return (
    <motion.li
      className="border-b border-[#374151] hover:bg-[#111827] transition-colors duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-[#F38120] bg-opacity-20 p-3 rounded-full">
            <FaCar className="text-[#F38120] text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {transaction.make} {transaction.model} ({transaction.year || "N/A"})
            </h3>
            <p className="text-gray-400">{new Date(transaction.timestamp).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span
            className={`px-2 py-1 ${transaction.PaymentStatus === "Paid" ? "bg-green-900 bg-opacity-30 text-green-500" : "bg-yellow-900 bg-opacity-30 text-yellow-500"} rounded-full text-xs font-semibold`}
          >
            {transaction.PaymentStatus || transaction.transactionStatus}
          </span>
          <motion.button
            onClick={toggleDetails}
            className="text-gray-400 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-[#111827] p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[#F38120] font-semibold mb-2">Transaction Details</h4>
                <p className="text-gray-300">
                  <span className="text-gray-500">Transaction ID:</span> {transaction.TransactionId}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Type:</span> {transaction.transactionType || "Vehicle Registration"}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Date:</span> {new Date(transaction.timestamp).toLocaleString()}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Status:</span> {transaction.transactionStatus}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Payment Status:</span> {transaction.PaymentStatus}
                </p>
                {transaction.approvalDate && (
                  <p className="text-gray-300">
                    <span className="text-gray-500">Approval Date:</span>{" "}
                    {new Date(transaction.approvalDate).toLocaleString()}
                  </p>
                )}
                {transaction.approverId && (
                  <p className="text-gray-300">
                    <span className="text-gray-500">Approver ID:</span> {transaction.approverId}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-[#F38120] font-semibold mb-2">Vehicle & User Details</h4>
                <p className="text-gray-300">
                  <span className="text-gray-500">Vehicle:</span> {transaction.make} {transaction.model} (
                  {transaction.year || "N/A"})
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Color:</span> {transaction.color}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Chassis:</span> {transaction.chassisNumber}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Engine:</span> {transaction.engineNumber}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">From User:</span> {transaction.fromUserName}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">From User ID:</span> {transaction.fromUserId}
                </p>
                {transaction.DocumentType && (
                  <p className="text-gray-300">
                    <span className="text-gray-500">Document Type:</span> {transaction.DocumentType}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onViewDetails(transaction)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors mr-2"
              >
                <FaEye className="mr-2" />
                View Details
              </button>
              {transaction.transactionStatus === "Pending" && transaction.PaymentStatus === "Paid" && (
                <button
                  onClick={() => onGenerateEtag(transaction)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <FaTag className="mr-2" />
                  Generate E-Tag
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

/* =======================================================================
 FILTER PANEL
 ===================================================================== */
const FilterPanel = ({ filters, setFilters, onApplyFilters, onResetFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1f2937] rounded-lg p-4 mb-6 border border-[#374151]"
    >
      <h3 className="text-white font-semibold mb-4 flex items-center">
        <FaFilter className="mr-2" /> Advanced Filters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">From Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full bg-[#111827] text-white border border-[#374151] rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#F38120]"
            />
            <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">To Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full bg-[#111827] text-white border border-[#374151] rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#F38120]"
            />
            <FaCalendarAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Vehicle Make</label>
          <input
            type="text"
            placeholder="e.g. Toyota, Honda"
            value={filters.vehicleMake}
            onChange={(e) => setFilters({ ...filters, vehicleMake: e.target.value })}
            className="w-full bg-[#111827] text-white border border-[#374151] rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#F38120]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">User ID</label>
          <input
            type="text"
            placeholder="Enter User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="w-full bg-[#111827] text-white border border-[#374151] rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#F38120]"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Approver ID</label>
          <input
            type="text"
            placeholder="Enter Approver ID"
            value={filters.approverId}
            onChange={(e) => setFilters({ ...filters, approverId: e.target.value })}
            className="w-full bg-[#111827] text-white border border-[#374151] rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#F38120]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onResetFilters}
          className="bg-[#374151] hover:bg-[#4b5563] text-white py-2 px-4 rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onApplyFilters}
          className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  )
}

/* =======================================================================
 PAID TRANSACTIONS
 ===================================================================== */
const PaidTransactions = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    vehicleMake: "",
    userId: "",
    approverId: "",
  })
  const [sortField, setSortField] = useState("timestamp")
  const [sortDirection, setSortDirection] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Get token and decode userId
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

    fetchPaidTransactions()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [transactions, searchTerm, filters, sortField, sortDirection])

  const fetchPaidTransactions = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions/paid",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data) {
        console.log("API Response:", response.data)
        setTransactions(response.data)
        setError(null)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err) {
      console.error("Error fetching paid transactions:", err)
      setError("Failed to load transaction data. Please try again.")
      Swal.fire("Error", "Failed to fetch transaction data", "error")
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let result = [...transactions]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (transaction) =>
          transaction?.TransactionId?.toLowerCase().includes(term) ||
          transaction?.fromUserName?.toLowerCase().includes(term) ||
          transaction?.make?.toLowerCase().includes(term) ||
          transaction?.model?.toLowerCase().includes(term) ||
          transaction?.chassisNumber?.toLowerCase().includes(term) ||
          transaction?.engineNumber?.toLowerCase().includes(term) ||
          transaction?.approverId?.toLowerCase().includes(term),
      )
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      result = result.filter((transaction) => new Date(transaction.timestamp) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      result = result.filter((transaction) => new Date(transaction.timestamp) <= toDate)
    }

    // Apply vehicle make filter
    if (filters.vehicleMake) {
      const makeFilter = filters.vehicleMake.toLowerCase()
      result = result.filter((transaction) => transaction?.make?.toLowerCase().includes(makeFilter))
    }

    // Apply user ID filter
    if (filters.userId) {
      result = result.filter((transaction) => transaction?.fromUserId?.includes(filters.userId))
    }

    // Apply approver ID filter
    if (filters.approverId) {
      result = result.filter((transaction) => transaction?.approverId?.includes(filters.approverId))
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]

      // Handle date fields
      if (sortField === "timestamp" || sortField === "approvalDate") {
        valueA = valueA ? new Date(valueA).getTime() : 0
        valueB = valueB ? new Date(valueB).getTime() : 0
      }

      // Handle string fields
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

    setFilteredTransactions(result)
  }

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleViewDetails = (transaction) => {
    // Navigate to the transaction details page with the transaction ID
    navigate(`/transaction-details/${transaction.TransactionId}`)
  }

  const handleGenerateEtag = async (transaction) => {
    try {
      // Show loading state
      Swal.fire({
        title: "Generating E-Tag",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Call the API to approve registration and generate E-Tag
      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/approveRegistration",
        {
          transactionId: transaction.TransactionId,
          approvedBy: userId, // Use the logged-in user's ID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Close the loading dialog
      Swal.close()

      // Show success message with the generated E-Tag
      if (response.data && response.data.registrationNumber) {
        // Send email notification about E-Tag generation
        try {
          // Get user email from the backend
          const userResponse = await axios.get(
            `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${transaction.fromUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          const userEmail = userResponse.data.email
          const userName = userResponse.data.name || transaction.fromUserName || "User"

          // Send email notification
          const emailData = {
            to: userEmail,
            subject: "Vehicle E-Tag Generated Successfully",
            data: {
              user: userName,
              action: "received an E-Tag for your vehicle",
              vehicle: `${transaction.make} ${transaction.model} (${transaction.year || "N/A"})`,
              status: `Your vehicle has been registered successfully with E-Tag: ${response.data.registrationNumber}`,
            },
          }

          // Send the email notification
          await axios.post(
            "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-email",
            emailData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )

          console.log("E-Tag generation email notification sent successfully")

          Swal.fire({
            title: "E-Tag Generated Successfully",
            html: `
            <div class="text-center">
              <p class="mb-4">The E-Tag has been generated and assigned to the vehicle.</p>
              <div class="bg-gray-100 p-4 rounded-lg inline-block">
                <span class="font-bold text-xl">${response.data.registrationNumber}</span>
              </div>
              <p class="mt-4">A confirmation email has been sent to ${userEmail}</p>
            </div>
          `,
            icon: "success",
            confirmButtonColor: "#F38120",
          })
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError)

          // Show success message but mention email failure
          Swal.fire({
            title: "E-Tag Generated Successfully",
            html: `
            <div class="text-center">
              <p class="mb-4">The E-Tag has been generated and assigned to the vehicle.</p>
              <div class="bg-gray-100 p-4 rounded-lg inline-block">
                <span class="font-bold text-xl">${response.data.registrationNumber}</span>
              </div>
              <p class="mt-4 text-orange-500">Note: Could not send email notification. Please inform the vehicle owner manually.</p>
            </div>
          `,
            icon: "success",
            confirmButtonColor: "#F38120",
          })
        }

        // Refresh the transactions list to show updated status
        fetchPaidTransactions()
      } else {
        throw new Error("No registration number returned from the server")
      }
    } catch (error) {
      console.error("Error generating E-Tag:", error)
      Swal.fire({
        title: "Error",
        text: error.response?.data?.msg || "Failed to generate E-Tag. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    }
  }

  const handleGenerateReport = () => {
    try {
      Swal.fire({
        title: "Generating Report",
        text: "Please wait while we generate your report...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      setTimeout(() => {
        Swal.close()
        Swal.fire({
          icon: "success",
          title: "Report Generated",
          text: "The transactions report has been downloaded successfully.",
          confirmButtonColor: "#F38120",
        })
      }, 2000)
    } catch (error) {
      console.error("Error generating report:", error)
      Swal.fire("Error", "Failed to generate report", "error")
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilters({
      dateFrom: "",
      dateTo: "",
      vehicleMake: "",
      userId: "",
      approverId: "",
    })
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setCurrentPage(1)
    applyFiltersAndSort()
    setShowFilters(false)
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#111827]">
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
            {/* Header with title and actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Paid Transactions</h1>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-[#1f2937] hover:bg-[#374151] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <FaFilter className="mr-2" />
                  Filters
                </button>

                <button
                  onClick={handleGenerateReport}
                  className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <FaFilePdf className="mr-2" />
                  Generate Report
                </button>

                <button
                  onClick={fetchPaidTransactions}
                  className="bg-[#1f2937] hover:bg-[#374151] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  disabled={loading}
                >
                  <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search by ID, name, vehicle, approver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1f2937] text-white border border-[#374151] rounded-lg py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  onApplyFilters={applyFilters}
                  onResetFilters={resetFilters}
                />
              )}
            </AnimatePresence>

            {/* Sort Controls */}
            <div className="bg-[#1f2937] rounded-lg p-4 mb-6 border border-[#374151]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-gray-400">Sort by:</span>

                <button
                  onClick={() => handleSort("timestamp")}
                  className={`flex items-center px-3 py-1 rounded ${
                    sortField === "timestamp"
                      ? "bg-[#F38120] text-white"
                      : "bg-[#111827] text-gray-300 hover:bg-[#374151]"
                  }`}
                >
                  Date
                  {sortField === "timestamp" && (
                    <span className="ml-1">{sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}</span>
                  )}
                </button>

                <button
                  onClick={() => handleSort("make")}
                  className={`flex items-center px-3 py-1 rounded ${
                    sortField === "make" ? "bg-[#F38120] text-white" : "bg-[#111827] text-gray-300 hover:bg-[#374151]"
                  }`}
                >
                  Vehicle
                  {sortField === "make" && (
                    <span className="ml-1">{sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}</span>
                  )}
                </button>

                <button
                  onClick={() => handleSort("fromUserName")}
                  className={`flex items-center px-3 py-1 rounded ${
                    sortField === "fromUserName"
                      ? "bg-[#F38120] text-white"
                      : "bg-[#111827] text-gray-300 hover:bg-[#374151]"
                  }`}
                >
                  User
                  {sortField === "fromUserName" && (
                    <span className="ml-1">{sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}</span>
                  )}
                </button>

                <button
                  onClick={() => handleSort("approverId")}
                  className={`flex items-center px-3 py-1 rounded ${
                    sortField === "approverId"
                      ? "bg-[#F38120] text-white"
                      : "bg-[#111827] text-gray-300 hover:bg-[#374151]"
                  }`}
                >
                  Approver
                  {sortField === "approverId" && (
                    <span className="ml-1">{sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-[#1f2937] rounded-lg overflow-hidden shadow-xl border border-[#374151]">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-16 h-16 border-4 border-[#F38120] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center p-8">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchPaidTransactions}
                    className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center p-8">
                  <FaCar className="text-gray-600 text-5xl mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No paid transactions found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-[#374151]">
                    <AnimatePresence>
                      {currentItems.map((transaction) => (
                        <TransactionListItem
                          key={transaction.TransactionId}
                          transaction={transaction}
                          onViewDetails={handleViewDetails}
                          onGenerateEtag={handleGenerateEtag}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>

                  {/* Pagination */}
                  {filteredTransactions.length > itemsPerPage && (
                    <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-t border-[#374151]">
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-400">
                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="font-medium">
                              {Math.min(indexOfLastItem, filteredTransactions.length)}
                            </span>{" "}
                            of <span className="font-medium">{filteredTransactions.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#374151] bg-[#1f2937] text-sm font-medium ${
                                currentPage === 1
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-gray-400 hover:bg-[#374151]"
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <FaChevronUp className="h-5 w-5 transform rotate-90" />
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => paginate(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 ${
                                    currentPage === pageNum
                                      ? "bg-[#F38120] text-white border-[#F38120]"
                                      : "bg-[#1f2937] text-gray-400 border-[#374151] hover:bg-[#374151]"
                                  } text-sm font-medium`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}

                            <button
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#374151] bg-[#1f2937] text-sm font-medium ${
                                currentPage === totalPages
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-gray-400 hover:bg-[#374151]"
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <FaChevronUp className="h-5 w-5 transform -rotate-90" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PaidTransactions
