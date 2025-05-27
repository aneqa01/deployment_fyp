"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { FaIdCard, FaDollarSign, FaCar, FaArrowLeft, FaExchangeAlt } from "react-icons/fa"
import { AuthContext } from "../context/AuthContext"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

const UserTransferTo = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vehicle, setVehicle] = useState(null)
  const [formData, setFormData] = useState({
    newOwnerCnic: "",
    transferFee: "",
    confirmCnic: "",
  })
  const [errors, setErrors] = useState({})

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  const storedToken = localStorage.getItem("token")
  const decoded = jwtDecode(storedToken)
  const currentOwnerId = decoded.userId

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const response = await axios.get(`https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicleById?vehicleId=${vehicleId}`)
        setVehicle(response.data)
      } catch (error) {
        console.error("Error fetching vehicle details:", error)
        alert("Error fetching vehicle details")
      }
    }

    if (vehicleId) {
      fetchVehicleDetails()
    }
  }, [vehicleId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // CNIC validation - simplified
    if (!formData.newOwnerCnic) {
      newErrors.newOwnerCnic = "New owner CNIC is required"
    }

    // Confirm CNIC validation - simplified
    if (!formData.confirmCnic) {
      newErrors.confirmCnic = "Please confirm the CNIC"
    } else if (formData.newOwnerCnic !== formData.confirmCnic) {
      newErrors.confirmCnic = "CNIC does not match"
    }

  

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const transferData = {
        vehicleId: vehicleId,
        currentOwnerId: currentOwnerId,
        newOwnerCnic: formData.newOwnerCnic, // No need to remove dashes
        transferFee: Number.parseFloat(formData.transferFee),
      }

      console.log("Sending transfer data:", transferData)

      const response = await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transferOwnership", transferData)

      if (response.status === 200) {
        alert("Ownership transfer request submitted successfully!")
        navigate("/user-ownership-transfer")
      }
    } catch (error) {
      console.error("Error submitting transfer request:", error)
      alert(error.response?.data?.msg || "Error submitting transfer request")
    } finally {
      setLoading(false)
    }
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-[#F38120]">Loading vehicle details...</div>
      </div>
    )
  }

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
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <button
                onClick={() => navigate("/user-ownership-transfer")}
                className="flex items-center text-[#F38120] hover:text-[#DC5F00] mb-4 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Vehicle List
              </button>
              <h1 className="text-4xl font-bold text-[#F38120] text-center">Transfer Vehicle Ownership</h1>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vehicle Details Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-[#4A4D52] mb-4 flex items-center">
                  <FaCar className="mr-3 text-[#F38120]" />
                  Vehicle Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#F38120]">Make & Model:</span>
                    <span className="text-gray-600">
                      {vehicle.make} {vehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#F38120]">Year:</span>
                    <span className="text-gray-600">{vehicle.manufactureYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#F38120]">Color:</span>
                    <span className="text-gray-600">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#F38120]">Registration:</span>
                    <span className="text-gray-600">{vehicle.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#F38120]">Chassis Number:</span>
                    <span className="text-gray-600">{vehicle.chassisNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#F38120]">Engine Number:</span>
                    <span className="text-gray-600">{vehicle.engineNumber}</span>
                  </div>
                </div>
              </motion.div>

              {/* Transfer Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-[#4A4D52] mb-6 flex items-center">
                  <FaExchangeAlt className="mr-3 text-[#F38120]" />
                  Transfer Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Owner CNIC */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D52] mb-2">
                      <FaIdCard className="inline mr-2 text-[#F38120]" />
                      New Owner CNIC
                    </label>
                    <input
                      type="text"
                      name="newOwnerCnic"
                      value={formData.newOwnerCnic}
                      onChange={handleInputChange}
                      placeholder="Enter new owner CNIC"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120] ${
                        errors.newOwnerCnic ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.newOwnerCnic && <p className="text-red-500 text-sm mt-1">{errors.newOwnerCnic}</p>}
                  </div>

                  {/* Confirm CNIC */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D52] mb-2">
                      <FaIdCard className="inline mr-2 text-[#F38120]" />
                      Confirm New Owner CNIC
                    </label>
                    <input
                      type="text"
                      name="confirmCnic"
                      value={formData.confirmCnic}
                      onChange={handleInputChange}
                      placeholder="Confirm new owner CNIC"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120] ${
                        errors.confirmCnic ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.confirmCnic && <p className="text-red-500 text-sm mt-1">{errors.confirmCnic}</p>}
                  </div>

                 

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300 ${
                      loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#F38120] hover:bg-[#DC5F00] hover:shadow-lg"
                    }`}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting Request...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaExchangeAlt className="mr-2" />
                        Submit Transfer Request
                      </div>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Important Notice */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Once you submit this transfer request, it will be sent to the
                    authorities for approval. Make sure all details are correct before submitting. 
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserTransferTo
