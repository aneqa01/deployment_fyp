
import { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import RejectionModal from "../components/RejectionModal"
import { AuthContext } from "../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import { FaEye, FaCheck, FaTimes, FaFileInvoice } from "react-icons/fa"

// Challan Modal Component
const ChallanModal = ({ isOpen, onClose, onConfirm, requestId }) => {
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("Registration")

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      Swal.fire("Error", "Please enter a valid amount.", "error")
      return
    }
    onConfirm(requestId, amount, type)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-[#4A4D52] mb-6 text-center">Create Challan</h2>
        <div className="mb-6">
          <label className="block text-[#4A4D52] font-medium mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-gray-50 text-[#4A4D52] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>
        <div className="mb-6">
          <label className="block text-[#4A4D52] font-medium mb-2" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 bg-gray-50 text-[#4A4D52] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
          >
            <option value="Registration">Registration</option>
            <option value="Ownership Transfer">Ownership Transfer</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-[#4A4D52] px-6 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#F38120] to-[#F3A620] hover:shadow-lg text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const InspectionOfficerRequests = () => {
  const [inspectionRequests, setInspectionRequests] = useState([])
  const [acceptedRequests, setAcceptedRequests] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState("asc")
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showChallanModal, setShowChallanModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [modalAction, setModalAction] = useState(null)

  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken)
        setLoggedInUserId(decoded?.id || decoded?.userId)
      } catch (err) {
        Swal.fire("Error", "Failed to authenticate user.", "error")
        logout()
      }
    }
  }, [logout])

  useEffect(() => {
    if (!user || user.role !== "InspectionOfficer") {
      Swal.fire("Unauthorized", "Access denied!", "error")
      logout()
    }
  }, [user, logout])

  useEffect(() => {
    if (!loggedInUserId) return

    const fetchInspectionRequests = async () => {
      try {
        const response = await axios.get(
          "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/fetch-inspection-request-byOfficialID",
          { params: { officerId: loggedInUserId } },
        )
        const allRequests = response.data.data
        const pending = allRequests.filter((req) => req.Status === "Pending")
        // Initialize accepted requests with hasChallan: false
        const approved = allRequests
          .filter((req) => req.Status === "Approved")
          .map((req) => ({ ...req, hasChallan: false }))
        setInspectionRequests(pending)
        setAcceptedRequests(approved)
      } catch (error) {
        Swal.fire("Error", "Failed to fetch inspection requests.", "error")
      }
    }

    if (loggedInUserId) {
      fetchInspectionRequests()
    }
  }, [loggedInUserId])

  const sortByDate = () => {
    const sorted = [...inspectionRequests].sort((a, b) => {
      const dateA = new Date(a.AppointmentDate || 0)
      const dateB = new Date(b.AppointmentDate || 0)
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })
    setInspectionRequests(sorted)
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const approveRequest = async (requestId, amount, type) => {
    try {
      await axios.put("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/approveInspection", {
        requestId,
      })
      await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/createChallan", {
        vehicleId: inspectionRequests.find((req) => req.InspectionId === requestId).VehicleId,
        amount: Number.parseFloat(amount),
        type,
      })
      Swal.fire("Success", "Approved vehicle and challan created successfully!", "success")

      const acceptedRequest = inspectionRequests.find((req) => req.InspectionId === requestId)
      if (acceptedRequest) {
        setAcceptedRequests((prev) => [...prev, { ...acceptedRequest, hasChallan: true }])
      }
      setInspectionRequests((prev) => prev.filter((req) => req.InspectionId !== requestId))
      setShowChallanModal(false)
    } catch (error) {
      Swal.fire("Error", "Failed to approve request or create challan.", "error")
    }
  }

  const createChallanForApproved = async (requestId, amount, type) => {
    try {
      await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/createChallan", {
        vehicleId: acceptedRequests.find((req) => req.InspectionId === requestId).VehicleId,
        amount: Number.parseFloat(amount),
        type,
      })
      Swal.fire("Success", "Challan created successfully!", "success")
      setAcceptedRequests((prev) =>
        prev.map((req) => (req.InspectionId === requestId ? { ...req, hasChallan: true } : req)),
      )
      setShowChallanModal(false)
    } catch (error) {
      Swal.fire("Error", "Failed to create challan.", "error")
    }
  }

  const handleChallanSubmit = (requestId, amount, type) => {
    if (modalAction === "approve") {
      approveRequest(requestId, amount, type)
    } else if (modalAction === "createChallan") {
      createChallanForApproved(requestId, amount, type)
    }
  }

  const rejectRequest = async (requestId, reason) => {
    try {
      await axios.put("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/rejectInspection", {
        requestId,
        reason,
      })
      Swal.fire("Rejected", "Inspection request rejected!", "error")
      setInspectionRequests((prev) => prev.filter((req) => req.InspectionId !== requestId))
      setShowRejectionModal(false)
    } catch (error) {
      Swal.fire("Error", "Failed to reject request.", "error")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar navOpen={sidebarOpen} toggleNav={() => setSidebarOpen(!sidebarOpen)} userRole="InspectionOfficer" />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <motion.h1
            className="text-4xl font-bold text-[#F38120] bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] mb-8 text-center"
            // text-4xl font-bold text-[#F38120] text-center
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
             Inspection Requests
          </motion.h1>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            {/* Pending Requests Column */}
            <motion.div
              className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 overflow-hidden flex flex-col"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-3 h-8 bg-gradient-to-b from-[#F38120] to-[#F3A620] rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-[#4A4D52]">Pending Requests</h2>
                <span className="ml-auto bg-orange-100 text-[#F38120] px-3 py-1 rounded-full text-sm font-medium">
                  {inspectionRequests.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {inspectionRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaCheck className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium">No pending requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspectionRequests.map((req, index) => (
                      <motion.div
                        key={req.InspectionId}
                        className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-[#4A4D52] text-lg">ID: {req.InspectionId}</h3>
                            <p className="text-gray-600">Vehicle: {req.VehicleId}</p>
                            <p className="text-sm text-gray-500">
                              {req.AppointmentDate ? new Date(req.AppointmentDate).toLocaleDateString() : "No date set"}
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequestId(req.InspectionId)
                              setModalAction("approve")
                              setShowChallanModal(true)
                            }}
                            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <FaCheck className="mr-1 w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequestId(req.InspectionId)
                              setShowRejectionModal(true)
                            }}
                            className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <FaTimes className="mr-1 w-3 h-3" />
                            Reject
                          </button>
                          <Link
                            to={`/vehicle-details/${req.VehicleId}`}
                            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <FaEye className="mr-1 w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Approved Requests Column */}
            <motion.div
              className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 overflow-hidden flex flex-col"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-3 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-[#4A4D52]">Approved Requests</h2>
                <span className="ml-auto bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                  {acceptedRequests.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {acceptedRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaCheck className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium">No approved requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedRequests.map((req, index) => (
                      <motion.div
                        key={req.InspectionId}
                        className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-[#4A4D52] text-lg">ID: {req.InspectionId}</h3>
                            <p className="text-gray-600">Vehicle: {req.VehicleId}</p>
                            <p className="text-sm text-gray-500">
                              {req.AppointmentDate ? new Date(req.AppointmentDate).toLocaleDateString() : "No date set"}
                            </p>
                          </div>
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                            Approved
                          </span>
                        </div>
                        {!req.hasChallan && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequestId(req.InspectionId)
                                setModalAction("createChallan")
                                setShowChallanModal(true)
                              }}
                              className="flex items-center bg-gradient-to-r from-[#F38120] to-[#F3A620] hover:shadow-lg text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                            >
                              <FaFileInvoice className="mr-1 w-3 h-3" />
                              Create Challan
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={rejectRequest}
        requestId={selectedRequestId}
      />
      <ChallanModal
        isOpen={showChallanModal}
        onClose={() => setShowChallanModal(false)}
        onConfirm={handleChallanSubmit}
        requestId={selectedRequestId}
      />
    </div>
  )
}

export default InspectionOfficerRequests
