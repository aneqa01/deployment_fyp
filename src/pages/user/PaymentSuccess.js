"use client"

import { useEffect, useState, useContext, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { FaCheckCircle, FaHome, FaDownload, FaPrint } from "react-icons/fa"
import axios from "axios"
import Swal from "sweetalert2"
import { AuthContext } from "../../context/AuthContext"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { jwtDecode } from "jwt-decode"

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useContext(AuthContext)
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [paymentDetails, setPaymentDetails] = useState(null)
  const receiptRef = useRef(null)

  // Get token and decode userId similar to UserMyChallans
  const token = localStorage.getItem("token")
  let userId = null
  let isAuthenticated = false

  try {
    const decoded = jwtDecode(token)
    userId = decoded?.userId
    isAuthenticated = !!userId // Set to true if userId exists
    console.log("Decoded token:", decoded)
    console.log("User ID from token:", userId)
  } catch (error) {
    console.error("Error decoding token:", error)
    // Don't logout here, we'll handle it in useEffect
  }

  useEffect(() => {
    // Check if token is valid
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to signin")
      Swal.fire("Error", "Invalid session. Please sign in again.", "error")
      navigate("/signin")
      return
    }

    const verifyPayment = async () => {
      try {
        // Get parameters from URL query string
        const queryParams = new URLSearchParams(location.search)
        console.log("URL query params:", queryParams.toString())

        const sessionId = queryParams.get("session_id") || localStorage.getItem("stripe_session_id")
        const challanId = queryParams.get("challan_id") || localStorage.getItem("challan_id")

        console.log("Session ID from URL:", queryParams.get("session_id"))
        console.log("Challan ID from URL:", queryParams.get("challan_id"))
        console.log("Session ID from localStorage:", localStorage.getItem("stripe_session_id"))
        console.log("Challan ID from localStorage:", localStorage.getItem("challan_id"))

        if (!sessionId || !challanId) {
          throw new Error("Payment information not found")
        }

        console.log(`Verifying payment for session: ${sessionId}, challan: ${challanId}`)
        console.log(`User ID for verification: ${userId}`)

        // Call your backend to confirm the payment
        const response = await axios.post(
          "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/stripe/confirm-payment",
          {
            sessionId,
            challanId,
            userId, // Include userId in the request
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include token in headers
            },
          },
        )

        console.log("Payment verification response:", response.data)

        if (!response.data.success) {
          throw new Error(response.data.message || "Payment verification failed")
        }

        // Set payment details for receipt using the enhanced response data
        setPaymentDetails({
          challanId: challanId,
          paymentId: sessionId,
          paymentDate: new Date().toLocaleString(),
          amount: response.data.amount || localStorage.getItem("challan_amount"),
          challanType: response.data.challanType || localStorage.getItem("challan_type"),
          // Use the vehicle details from the response
          vehicleDetails: response.data.vehicleDetails || {
            make: localStorage.getItem("vehicle_make"),
            model: localStorage.getItem("vehicle_model"),
            chassisNumber: localStorage.getItem("chassis_number"),
          },
          // Use the user details from the response
          userDetails: response.data.userDetails || {
            name: localStorage.getItem("user_name"),
            cnic: localStorage.getItem("user_cnic"),
            phoneNumber: localStorage.getItem("user_phone_number"),
          },
        })

        // Clear the stored session data
        localStorage.removeItem("stripe_session_id")
        localStorage.removeItem("challan_id")

        // Clear any other stored challan details
        localStorage.removeItem("challan_amount")
        localStorage.removeItem("vehicle_make")
        localStorage.removeItem("vehicle_model")
        localStorage.removeItem("chassis_number")
        localStorage.removeItem("user_name")
        localStorage.removeItem("user_cnic")
        localStorage.removeItem("user_phone_number")
        localStorage.removeItem("challan_type")

        setSuccess(true)
      } catch (err) {
        console.error("Payment verification error:", err)
        setError(err.message || "Failed to verify payment")

        // Show error with SweetAlert
        Swal.fire({
          icon: "error",
          title: "Payment Verification Failed",
          text: err.message || "We could not verify your payment. Please contact support.",
          confirmButtonColor: "#F38120",
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [navigate, location, isAuthenticated, userId, token])

  const handleGoToDashboard = () => {
    navigate("/user-dashboard")
  }

  const downloadReceipt = () => {
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
      pdf.save(`challan-receipt-${paymentDetails?.challanId.substring(0, 8)}.pdf`)

      Swal.fire({
        icon: "success",
        title: "Receipt Downloaded",
        text: "Your payment receipt has been downloaded successfully.",
        confirmButtonColor: "#F38120",
      })
    })
  }

  const printReceipt = () => {
    if (!receiptRef.current) return

    const printWindow = window.open("", "_blank")
    printWindow.document.write("<html><head><title>Challan Payment Receipt</title>")
    printWindow.document.write("<style>")
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .receipt { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
      .receipt-header { text-align: center; margin-bottom: 20px; }
      .receipt-header h2 { color: #F38120; margin-bottom: 5px; }
      .receipt-body { margin-bottom: 20px; }
      .receipt-row { display: flex; margin-bottom: 10px; }
      .receipt-label { font-weight: bold; width: 200px; }
      .receipt-value { flex: 1; }
      .receipt-footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
      .receipt-status { text-align: center; margin: 20px 0; padding: 10px; background-color: #e6f7e6; color: #2e7d32; border-radius: 4px; }
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

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-[#F38120] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-[#4A4D52] mb-4">Verifying Your Payment</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment with our secure payment provider...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full"
      >
        {success ? (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <FaCheckCircle className="text-green-500 text-6xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#4A4D52]">Payment Successful!</h2>
              <p className="text-gray-600 mt-2">Your challan payment has been processed successfully.</p>
            </div>

            {/* Payment Receipt */}
            <div ref={receiptRef} className="receipt bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="receipt-header text-center border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-[#F38120]">Payment Receipt</h2>
                <p className="text-gray-500">SecureChain Vehicle Management System</p>
              </div>

              <div className="receipt-status bg-green-50 text-green-700 text-center py-2 px-4 rounded-md mb-6">
                <p className="font-semibold">Payment Status: PAID</p>
              </div>

              <div className="receipt-body grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-[#4A4D52] mb-3 border-b pb-2">Payment Details</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Challan ID:</span>
                      <span className="text-gray-800">{paymentDetails?.challanId?.substring(0, 12)}...</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Payment ID:</span>
                      <span className="text-gray-800">{paymentDetails?.paymentId?.substring(0, 12)}...</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Date & Time:</span>
                      <span className="text-gray-800">{paymentDetails?.paymentDate}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Amount Paid:</span>
                      <span className="text-gray-800 font-bold">${paymentDetails?.amount}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Payment Method:</span>
                      <span className="text-gray-800">Credit/Debit Card (Stripe)</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Challan Type:</span>
                      <span className="text-gray-800">{paymentDetails?.challanType || "Traffic Violation"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#4A4D52] mb-3 border-b pb-2">Vehicle & User Details</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Vehicle:</span>
                      <span className="text-gray-800">
                        {paymentDetails?.vehicleDetails?.make} {paymentDetails?.vehicleDetails?.model}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">Chassis No:</span>
                      <span className="text-gray-800">{paymentDetails?.vehicleDetails?.chassisNumber}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">User Name:</span>
                      <span className="text-gray-800">{paymentDetails?.userDetails?.name}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold text-gray-600 w-32">CNIC:</span>
                      <span className="text-gray-800">{paymentDetails?.userDetails?.cnic}</span>
                    </div>
                    {paymentDetails?.userDetails?.phoneNumber && (
                      <div className="flex">
                        <span className="font-semibold text-gray-600 w-32">Phone:</span>
                        <span className="text-gray-800">{paymentDetails.userDetails.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="receipt-footer text-center mt-8 pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  This is an electronically generated receipt and does not require a signature.
                </p>
                <p className="text-gray-500 text-sm mt-1">For any queries, please contact support@securechain.com</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadReceipt}
                className="bg-[#4A4D52] text-white py-3 px-6 rounded-lg shadow-md flex items-center justify-center font-semibold"
              >
                <FaDownload className="mr-2" />
                Download Receipt
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={printReceipt}
                className="bg-[#4A4D52] text-white py-3 px-6 rounded-lg shadow-md flex items-center justify-center font-semibold"
              >
                <FaPrint className="mr-2" />
                Print Receipt
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoToDashboard}
                className="bg-[#F38120] text-white py-3 px-6 rounded-lg shadow-md flex items-center justify-center font-semibold"
              >
                <FaHome className="mr-2" />
                Return to Dashboard
              </motion.button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-[#4A4D52] mb-4">Payment Verification Failed</h2>

            <p className="text-gray-600 mb-6">
              We could not verify your payment. Please contact support if you believe this is an error.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToDashboard}
              className="bg-[#F38120] text-white py-3 px-6 rounded-lg shadow-md flex items-center justify-center font-semibold mx-auto"
            >
              <FaHome className="mr-2" />
              Return to Dashboard
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PaymentSuccess
