import React, { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import ApprovalModal from "../components/ApprovalModal"
import RejectionModal from "../components/RejectionModal"
import { AuthContext } from "../context/AuthContext"
// NOTE: If using 'jwt-decode', the correct import is usually:
// import jwtDecode from "jwt-decode"
import { jwtDecode } from "jwt-decode"
import { FaSortUp, FaSortDown } from "react-icons/fa"

const InspectionOfficerRequests = () => {
  const [inspectionRequests, setInspectionRequests] = useState([])
  const [acceptedRequests, setAcceptedRequests] = useState([]) // NEW: For approved requests

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState("asc")
  const [loggedInUserId, setLoggedInUserId] = useState(null)

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState(null)

  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Decode token to get user ID
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

  // Ensure only an Inspection Officer can access
  useEffect(() => {
    if (!user || user.role !== "InspectionOfficer") {
      Swal.fire("Unauthorized", "Access denied!", "error")
      logout()
    }
  }, [user, logout])

  // Fetch all inspection requests for the logged-in officer
  useEffect(() => {
    if (!loggedInUserId) return

    const fetchInspectionRequests = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8085/api/fetch-inspection-request-byOfficialID",
          { params: { officerId: loggedInUserId } }
        );
        const allRequests = response.data.data;
  
        // Separate requests based on their Status
        const pending = allRequests.filter((req) => req.Status === "Pending");
        const approved = allRequests.filter((req) => req.Status === "Approved");
  
        setInspectionRequests(pending);
        setAcceptedRequests(approved);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch inspection requests.", "error");
      }
    };
  
    if (loggedInUserId) {
      fetchInspectionRequests();
    }
  }, [loggedInUserId]);
  // Sort requests by appointment date
  const sortByDate = () => {
    const sorted = [...inspectionRequests].sort((a, b) => {
      const dateA = new Date(a.AppointmentDate || 0)
      const dateB = new Date(b.AppointmentDate || 0)
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })
    setInspectionRequests(sorted)
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Approve request => Move it to acceptedRequests, remove from inspectionRequests
  const approveRequest = async (requestId) => {
    try {
      await axios.put("http://localhost:8085/api/approveInspection", { requestId })
      Swal.fire("Approved", "Inspection request approved!", "success")

      // Find the request being approved
      const acceptedRequest = inspectionRequests.find((req) => req.InspectionId === requestId)
      if (acceptedRequest) {
        // Move it to the accepted requests list
        setAcceptedRequests((prev) => [...prev, acceptedRequest])
      }

      // Remove it from the pending requests list
      setInspectionRequests((prev) => prev.filter((req) => req.InspectionId !== requestId))

      setShowApprovalModal(false) // close modal
    } catch (error) {
      Swal.fire("Error", "Failed to approve request.", "error")
    }
  }

  const rejectRequest = async (requestId, reason) => {
    try {
      await axios.put("http://localhost:8085/api/rejectInspection", { requestId, reason })
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

          {/* PENDING INSPECTION REQUESTS SECTION */}
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
                            setShowApprovalModal(true)
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

          {/* APPROVED REQUESTS SECTION */}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={approveRequest}
        requestId={selectedRequestId}
      />
      
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={rejectRequest}
        requestId={selectedRequestId}
      /> 
     
    </div>
  )
}

export default InspectionOfficerRequests
