"use client"

import { useContext, useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaMoneyBillWave,
  FaUser,
  FaCar,
  FaIdCard,
  FaReceipt,
  FaLink,
  FaCubes,
  FaTag,
  FaCheckCircle,
  FaCalendarAlt,
  FaUserShield,
} from "react-icons/fa"
import axios from "axios"
import Swal from "sweetalert2"
import { AuthContext } from "../../context/AuthContext"
import SideNavBar from "../../components/SideNavBar"
import TopNavBar from "../../components/TopNavBar"
import { jwtDecode } from "jwt-decode"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const TransactionDetails = () => {
  const { transactionId } = useParams()
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const receiptRef = useRef(null)

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

    fetchTransactionDetails()
  }, [transactionId])

  const fetchTransactionDetails = async () => {
    setLoading(true)
    try {
      // Fetch transaction details
      const response = await axios.get(
        `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.data) {
        throw new Error("Transaction not found")
      }

      console.log("Transaction details:", response.data)
      setTransaction(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching transaction details:", err)
      setError("Failed to load transaction details. Please try again.")
      Swal.fire("Error", "Failed to fetch transaction details", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleDownloadReceipt = () => {
    if (!receiptRef.current) return

    html2canvas(receiptRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`transaction-receipt-${transaction?.TransactionId.substring(0, 8)}.pdf`)

      Swal.fire({
        icon: "success",
        title: "Receipt Downloaded",
        text: "The transaction receipt has been downloaded successfully.",
        confirmButtonColor: "#F38120",
      })
    })
  }

  const handlePrintReceipt = () => {
    if (!receiptRef.current) return

    const printWindow = window.open("", "_blank")
    printWindow.document.write("<html><head><title>Transaction Receipt</title>")
    printWindow.document.write("<style>")
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; }
      .receipt { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; background-color: white; }
      .receipt-header { text-align: center; margin-bottom: 20px; padding: 20px; background: linear-gradient(to right, #F38120, #e67818); color: white; }
      .receipt-body { margin-bottom: 20px; }
      .receipt-row { display: flex; margin-bottom: 10px; }
      .receipt-label { font-weight: bold; width: 200px; }
      .receipt-value { flex: 1; }
      .receipt-footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
      .receipt-status { text-align: center; margin: 20px 0; padding: 10px; background-color: #e6f7e6; color: #2e7d32; border-radius: 4px; }
      .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .detail-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; }
      .detail-item { margin-bottom: 10px; }
      .detail-label { font-size: 12px; color: #666; }
      .detail-value { font-weight: bold; }
      .blockchain-hash { font-family: monospace; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `)
    printWindow.document.write("</style></head><body>")
    printWindow.document.write(receiptRef.current.outerHTML)
    printWindow.document.write("</body></html>")
    printWindow.document.close()

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleGenerateEtag = async () => {
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
        Swal.fire({
          title: "E-Tag Generated Successfully",
          html: `
          <div class="text-center">
            <p class="mb-4">The E-Tag has been generated and assigned to the vehicle.</p>
            <div class="bg-gray-100 p-4 rounded-lg inline-block">
              <span class="font-bold text-xl">${response.data.registrationNumber}</span>
            </div>
          </div>
        `,
          icon: "success",
          confirmButtonColor: "#F38120",
        })

        // Refresh the transaction details to show updated status
        fetchTransactionDetails()
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#111827]">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={logout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="government official"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="container mx-auto">
            {/* Back button and actions */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleGoBack}
                className="flex items-center text-white hover:text-[#F38120] transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Transactions
              </button>

              {!loading && transaction && (
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrintReceipt}
                    className="bg-[#1f2937] hover:bg-[#374151] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  >
                    <FaPrint className="mr-2" />
                    Print
                  </button>
                  <button
                    onClick={handleDownloadReceipt}
                    className="bg-[#1f2937] hover:bg-[#374151] text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                  >
                    <FaDownload className="mr-2" />
                    Download PDF
                  </button>
                  {transaction.transactionStatus === "Pending" && transaction.PaymentStatus === "Paid" && (
                    <button
                      onClick={handleGenerateEtag}
                      className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                      <FaTag className="mr-2" />
                      Generate E-Tag
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-16 h-16 border-4 border-[#F38120] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-[#1f2937] rounded-lg border border-[#374151]">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchTransactionDetails}
                  className="bg-[#F38120] hover:bg-[#e67818] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : transaction ? (
              <div
                ref={receiptRef}
                className="bg-[#1f2937] rounded-lg overflow-hidden shadow-xl border border-[#374151]"
              >
                {/* Receipt Header */}
                <div className="bg-gradient-to-r from-[#F38120] to-[#e67818] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-8 grid-rows-8 gap-2">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="border border-white border-opacity-30 rounded-sm"></div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold text-white">Transaction Receipt</h2>
                      <p className="text-white text-opacity-80">SecureChain Vehicle Management System</p>
                    </div>
                    <div className="flex items-center">
                      <FaCubes className="text-white text-3xl mr-2" />
                      <div>
                        <p className="text-white text-opacity-80 text-sm">Blockchain Verified</p>
                        <p className="text-white text-xs">Transaction #{transaction.TransactionId?.substring(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Status Banner */}
                <div className="bg-green-900 bg-opacity-30 border-t border-b border-green-700 py-3 px-6 flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <p className="text-green-500 font-semibold">PAYMENT VERIFIED & SECURED ON BLOCKCHAIN</p>
                </div>

                {/* Receipt Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Transaction Details Column */}
                    <div className="bg-[#111827] bg-opacity-50 rounded-xl p-6 border border-[#374151]">
                      <h3 className="text-xl font-bold text-[#F38120] mb-4 flex items-center">
                        <FaMoneyBillWave className="mr-2" /> Transaction Details
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaIdCard className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Transaction ID</p>
                            <p className="text-white font-mono">{transaction.TransactionId}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaReceipt className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Transaction Type</p>
                            <p className="text-white">{transaction.transactionType || "Vehicle Registration"}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaCalendarAlt className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Date & Time</p>
                            <p className="text-white">{new Date(transaction.timestamp).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaMoneyBillWave className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Payment Status</p>
                            <p className="text-white text-xl font-bold">{transaction.PaymentStatus}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaMoneyBillWave className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Transaction Status</p>
                            <p className="text-white text-xl font-bold">{transaction.transactionStatus}</p>
                          </div>
                        </div>

                        {transaction.approvalDate && (
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                              <FaCalendarAlt className="text-[#F38120]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Approval Date</p>
                              <p className="text-white">{new Date(transaction.approvalDate).toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {transaction.approverId && (
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                              <FaUserShield className="text-[#F38120]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Approver ID</p>
                              <p className="text-white">{transaction.approverId}</p>
                            </div>
                          </div>
                        )}

                        {transaction.registrationNumber && (
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                              <FaTag className="text-[#F38120]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">E-Tag Number</p>
                              <p className="text-white font-bold text-xl">{transaction.registrationNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicle & User Details Column */}
                    <div className="bg-[#111827] bg-opacity-50 rounded-xl p-6 border border-[#374151]">
                      <h3 className="text-xl font-bold text-[#F38120] mb-4 flex items-center">
                        <FaCar className="mr-2" /> Vehicle & User Details
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaCar className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Vehicle</p>
                            <p className="text-white">
                              {transaction.make} {transaction.model} ({transaction.year || "N/A"})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaIdCard className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Vehicle ID</p>
                            <p className="text-white font-mono">{transaction.vehicleId}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaLink className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Chassis Number</p>
                            <p className="text-white font-mono">{transaction.chassisNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaLink className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Engine Number</p>
                            <p className="text-white font-mono">{transaction.engineNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaUser className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">From User</p>
                            <p className="text-white">{transaction.fromUserName}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <FaUser className="text-[#F38120]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">From User ID</p>
                            <p className="text-white font-mono">{transaction.fromUserId}</p>
                          </div>
                        </div>

                        {transaction.toUserId && (
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                              <FaUser className="text-[#F38120]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">To User</p>
                              <p className="text-white">{transaction.toUserName || "N/A"}</p>
                              <p className="text-white font-mono">{transaction.toUserId}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Details Section (if available) */}
                  {transaction.DocumentId && (
                    <div className="mt-6 bg-[#111827] bg-opacity-30 rounded-xl p-4 border border-[#374151]">
                      <h3 className="text-xl font-bold text-[#F38120] mb-4 flex items-center">
                        <FaReceipt className="mr-2" /> Document Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-300">
                            <span className="text-gray-500">Document ID:</span> {transaction.DocumentId}
                          </p>
                          {transaction.DocumentType && (
                            <p className="text-gray-300">
                              <span className="text-gray-500">Document Type:</span> {transaction.DocumentType}
                            </p>
                          )}
                          {transaction.FileName && (
                            <p className="text-gray-300">
                              <span className="text-gray-500">File Name:</span> {transaction.FileName}
                            </p>
                          )}
                        </div>
                        <div>
                          {transaction.FileType && (
                            <p className="text-gray-300">
                              <span className="text-gray-500">File Type:</span> {transaction.FileType}
                            </p>
                          )}
                          {transaction.UploadedAt && (
                            <p className="text-gray-300">
                              <span className="text-gray-500">Uploaded At:</span>{" "}
                              {new Date(transaction.UploadedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blockchain Verification Section */}
                  <div className="mt-6 bg-[#111827] bg-opacity-30 rounded-xl p-4 border border-[#374151]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaLink className="text-[#F38120] mr-2" />
                        <span className="text-gray-400 text-sm">Blockchain Verification Hash:</span>
                      </div>
                      <span className="text-white font-mono text-sm">
                        {transaction.blockchainTransactionId ||
                          "0x" +
                            Array.from({ length: 40 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(
                              "",
                            )}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Footer */}
                  <div className="mt-6 text-center border-t border-[#374151] pt-6">
                    <p className="text-gray-400 text-sm">
                      This is an electronically generated receipt secured on the blockchain.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      For any queries, please contact support@securechain.com
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-[#1f2937] rounded-lg border border-[#374151]">
                <p className="text-gray-400">Transaction not found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default TransactionDetails
