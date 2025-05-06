import React, { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import RejectionModal from "../components/RejectionModal"
import { AuthContext } from "../context/AuthContext"
import { jwtDecode } from "jwt-decode"
import { FaSortUp, FaSortDown } from "react-icons/fa"

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
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <h2 className="text-2xl font-semibold text-orange-400 mb-4">Create Challan</h2>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-400"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-400"
          >
            <option value="Registration">Registration</option>
            <option value="Ownership Transfer">Ownership Transfer</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            Submit
          </button>
        </div>
      </div>
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
          { params: { officerId: loggedInUserId } }
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
      await axios.put("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/approveInspection", { requestId })
      await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/createChallan", {
        vehicleId: inspectionRequests.find((req) => req.InspectionId === requestId).VehicleId,
        amount: parseFloat(amount),
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
        amount: parseFloat(amount),
        type,
      })
      Swal.fire("Success", "Challan created successfully!", "success")
      setAcceptedRequests((prev) =>
        prev.map((req) =>
          req.InspectionId === requestId ? { ...req, hasChallan: true } : req
        )
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
      await axios.put("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/rejectInspection", { requestId, reason })
      Swal.fire("Rejected", "Inspection request rejected!", "error")
      setInspectionRequests((prev) => prev.filter((req) => req.InspectionId !== requestId))
      setShowRejectionModal(false)
    } catch (error) {
      Swal.fire("Error", "Failed to reject request.", "error")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-300">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="InspectionOfficer"
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <motion.h1 className="text-4xl font-bold text-orange-400 mb-8 text-center">
            🚗 Inspection Requests
          </motion.h1>

          <div className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-orange-400 mb-4">Pending Inspection Requests</h2>

            {inspectionRequests.length === 0 ? (
              <p className="text-center text-lg font-semibold text-gray-400 py-10">
                No pending requests found.
              </p>
            ) : (
              <table className="w-full text-sm border-separate border-spacing-y-3">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 rounded-lg">
                    <th className="p-3 border-b border-gray-600 text-left">ID</th>
                    <th className="p-3 border-b border-gray-600 text-left">Vehicle</th>
                    <th className="p-3 border-b border-gray-600 text-left">Status</th>
                    <th
                      className="p-3 border-b border-gray-600 text-left cursor-pointer flex items-center gap-2"
                      onClick={sortByDate}
                    >
                      Appointment
                      {sortOrder === "asc" ? (
                        <FaSortUp className="text-gray-400" />
                      ) : (
                        <FaSortDown className="text-gray-400" />
                      )}
                    </th>
                    <th className="p-3 border-b border-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionRequests.map((req, index) => (
                    <motion.tr
                      key={req.InspectionId}
                      className={`transition-all hover:bg-gray-700 ${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      } border border-gray-700 rounded-lg shadow-md`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <td className="p-3">{req.InspectionId}</td>
                      <td className="p-3">{req.VehicleId}</td>
                      <td className="p-3">{req.Status || "Pending"}</td>
                      <td className="p-3">
                        {req.AppointmentDate
                          ? new Date(req.AppointmentDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3 flex justify-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedRequestId(req.InspectionId)
                            setModalAction("approve")
                            setShowChallanModal(true)
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequestId(req.InspectionId)
                            setShowRejectionModal(true)
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                        >
                          Reject
                        </button>
                        <Link
                          to={`/vehicle-details/${req.VehicleId}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition"
                        >
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {acceptedRequests.length > 0 && (
            <div className="bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700 mt-10">
              <h2 className="text-2xl font-semibold text-green-400 mb-4">
                ✅ Approved Requests
              </h2>
              <table className="w-full text-sm border-separate border-spacing-y-3">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 rounded-lg">
                    <th className="p-3 border-b border-gray-600 text-left">ID</th>
                    <th className="p-3 border-b border-gray-600 text-left">Vehicle</th>
                    <th className="p-3 border-b border-gray-600 text-left">Status</th>
                    <th className="p-3 border-b border-gray-600 text-left">Appointment</th>
                    <th className="p-3 border-b border-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedRequests.map((req, index) => (
                    <motion.tr
                      key={req.InspectionId}
                      className={`transition-all hover:bg-gray-700 ${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      } border border-gray-700 rounded-lg shadow-md`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <td className="p-3">{req.InspectionId}</td>
                      <td className="p-3">{req.VehicleId}</td>
                      <td className="p-3 text-green-400 font-bold">Approved</td>
                      <td className="p-3">
                        {req.AppointmentDate
                          ? new Date(req.AppointmentDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3 flex justify-center space-x-3">
                        {!req.hasChallan && (
                          <button
                            onClick={() => {
                              setSelectedRequestId(req.InspectionId)
                              setModalAction("createChallan")
                              setShowChallanModal(true)
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition"
                          >
                            Create Challan
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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