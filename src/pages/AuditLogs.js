"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { FaCarAlt, FaUser, FaClock, FaSpinner, FaFileAlt } from "react-icons/fa"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import Swal from "sweetalert2"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

const TransactionCard = ({ transaction, onPreview }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden h-full"
      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(243, 129, 32, 0.3)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-[#4A4D52] mb-4">
          {transaction.transactionType || "Vehicle Registration"}
        </h3>
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">From</h4>
            <div className="flex items-center">
              <FaUser className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{transaction.fromUserName || transaction.FromUserName}</span>
            </div>
          </div>
          {(transaction.toUserName || transaction.ToUserName) && (
            <div>
              <h4 className="font-semibold text-[#F38120] mb-1">To</h4>
              <div className="flex items-center">
                <FaUser className="text-[#F38120] mr-2" />
                <span className="text-gray-600">{transaction.toUserName || transaction.ToUserName}</span>
              </div>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Vehicle</h4>
            <div className="flex items-center">
              <FaCarAlt className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{`${transaction.make} ${transaction.model} (${transaction.year || "N/A"})`}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Timestamp</h4>
            <div className="flex items-center">
              <FaClock className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Preview PDF Button */}
        <div className="mt-4 flex justify-end">
          <button
            className="bg-[#F38120] text-white px-4 py-2 rounded hover:bg-[#DC5F00] transition-all duration-300 text-sm font-semibold"
            onClick={() => onPreview(transaction)}
          >
            Preview PDF
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const Transactions = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext) || { logout: () => {} }
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [previewTransaction, setPreviewTransaction] = useState(null)
  const [showAllTransactions, setShowAllTransactions] = useState(true) // Toggle state
  const [isGenerating, setIsGenerating] = useState(false) // For spinner

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
        if (logout) logout()
        navigate("/signin")
      })
      return
    }

    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data)
      } else {
        console.error("API did not return an array:", response.data)
        setTransactions([])
        Swal.fire({
          title: "Data Error",
          text: "The server returned an invalid data format. Please try again later.",
          icon: "error",
          confirmButtonColor: "#F38120",
        })
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to fetch transactions. Please try again later.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewPDF = (transaction) => {
    setPreviewTransaction(transaction)
  }

  const handleDownloadPDF = async (transactionId) => {
    setIsGenerating(true)
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
        { transactionId },
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
      link.download = `transaction-${transactionId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      Swal.fire({
        icon: "success",
        title: "PDF Downloaded",
        text: "The transaction PDF has been downloaded successfully.",
        confirmButtonColor: "#F38120",
      })
    } catch (error) {
      console.error("Error generating transaction PDF:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to generate transaction PDF. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAllPDFs = async () => {
    setIsGenerating(true)
    try {
      Swal.fire({
        title: "Generating PDF",
        text: "Please wait while we generate your report...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/generateAllTransactionsPDF",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      )

      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "all-transactions.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      Swal.fire({
        icon: "success",
        title: "PDF Downloaded",
        text: "All transactions PDF has been downloaded successfully.",
        confirmButtonColor: "#F38120",
      })
    } catch (error) {
      console.error("Error generating all transactions PDF:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to generate all transactions PDF. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="government official"
          logout={() => {
            if (logout) logout()
            navigate("/signin")
          }}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold text-[#F38120]">Transactions</h1>
              <div className="flex items-center">
                <label className="mr-3 font-semibold">View:</label>
                <select
                  className="bg-white border border-gray-300 rounded px-4 py-2"
                  value={showAllTransactions ? "all" : "pdf"}
                  onChange={(e) => setShowAllTransactions(e.target.value === "all")}
                >
                  <option value="all">All Transactions</option>
                  <option value="pdf">Download All PDFs</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="text-[#F38120] text-4xl animate-spin" />
              </div>
            ) : showAllTransactions ? (
              transactions.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                >
                  <AnimatePresence>
                    {transactions.map((transaction) => (
                      <motion.div
                        key={transaction.TransactionId}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                      >
                        <TransactionCard transaction={transaction} onPreview={handlePreviewPDF} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                  <FaFileAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transactions Found</h3>
                  <p className="text-gray-500">There are no transactions in the system yet.</p>
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <button
                  className="bg-[#F38120] text-white px-6 py-3 rounded hover:bg-[#DC5F00] transition-all duration-300 mx-auto flex items-center"
                  onClick={handleDownloadAllPDFs}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FaFileAlt className="mr-2" />
                      Download All PDFs
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {previewTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Transaction Preview</h2>
            <p className="mb-2">
              <strong>From:</strong> {previewTransaction.fromUserName || previewTransaction.FromUserName}
            </p>
            {(previewTransaction.toUserName || previewTransaction.ToUserName) && (
              <p className="mb-2">
                <strong>To:</strong> {previewTransaction.toUserName || previewTransaction.ToUserName}
              </p>
            )}
            <p className="mb-2">
              <strong>Vehicle:</strong> {`${previewTransaction.make} ${previewTransaction.model}`}
            </p>
            <p className="mb-2">
              <strong>Status:</strong> {previewTransaction.transactionStatus}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {new Date(previewTransaction.timestamp).toLocaleString()}
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={() => setPreviewTransaction(null)}
              >
                Close
              </button>
              <button
                className="bg-[#F38120] text-white px-4 py-2 rounded flex items-center"
                onClick={() => {
                  setPreviewTransaction(null)
                  handleDownloadPDF(previewTransaction.TransactionId)
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaFileAlt className="mr-2" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
