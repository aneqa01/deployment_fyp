"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaCar, FaExchangeAlt, FaArrowRight, FaSpinner } from "react-icons/fa"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Swal from "sweetalert2"

const VehicleTransferDropdown = ({ onTransferInitiated }) => {
  const [fromVehicles, setFromVehicles] = useState([])
  const [toVehicles, setToVehicles] = useState([])
  const [selectedFromVehicle, setSelectedFromVehicle] = useState("")
  const [selectedToVehicle, setSelectedToVehicle] = useState("")
  const [loading, setLoading] = useState(false)
  const [transferring, setTransferring] = useState(false)

  // Get user ID from token
  const token = localStorage.getItem("token")
  let userId = null
  try {
    if (token) {
      const decoded = jwtDecode(token)
      userId = decoded?.userId
    }
  } catch (error) {
    console.error("Error decoding token:", error)
  }

  useEffect(() => {
    if (userId) {
      fetchVehicleData()
    }
  }, [userId])

  const fetchVehicleData = async () => {
    setLoading(true)
    try {
      // Fetch registered vehicles for "From" dropdown (vehicles with E-Tags)
      const fromResponse = await axios.get(
        `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicles/registered/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Fetch unregistered vehicles for "To" dropdown (vehicles without E-Tags)
      const toResponse = await axios.get(
        `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicles/unregistered/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      console.log("From vehicles response:", fromResponse.data)
      console.log("To vehicles response:", toResponse.data)

      // Handle different possible response formats
      let registeredVehicles = []
      let unregisteredVehicles = []

      // Check if response.data is an array or has a data property
      if (Array.isArray(fromResponse.data)) {
        registeredVehicles = fromResponse.data
      } else if (fromResponse.data && Array.isArray(fromResponse.data.data)) {
        registeredVehicles = fromResponse.data.data
      } else if (fromResponse.data && typeof fromResponse.data === "object") {
        // If it's an object but not an array, try to extract vehicles
        registeredVehicles = Object.values(fromResponse.data).filter(
          (item) => item && typeof item === "object" && item.value && item.label,
        )
      }

      if (Array.isArray(toResponse.data)) {
        unregisteredVehicles = toResponse.data
      } else if (toResponse.data && Array.isArray(toResponse.data.data)) {
        unregisteredVehicles = toResponse.data.data
      } else if (toResponse.data && typeof toResponse.data === "object") {
        // If it's an object but not an array, try to extract vehicles
        unregisteredVehicles = Object.values(toResponse.data).filter(
          (item) => item && typeof item === "object" && item.value && item.label,
        )
      }

      console.log("Processed registered vehicles:", registeredVehicles)
      console.log("Processed unregistered vehicles:", unregisteredVehicles)

      // Ensure we always set arrays (even if empty)
      setFromVehicles(Array.isArray(registeredVehicles) ? registeredVehicles : [])
      setToVehicles(Array.isArray(unregisteredVehicles) ? unregisteredVehicles : [])
    } catch (error) {
      console.error("Error fetching vehicle data:", error)
      console.error("Error details:", error.response?.data)

      // Set empty arrays on error to prevent map errors
      setFromVehicles([])
      setToVehicles([])

      Swal.fire({
        title: "Error",
        text: "Failed to load vehicle data for transfer",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!selectedFromVehicle || !selectedToVehicle) {
      Swal.fire({
        title: "Selection Required",
        text: "Please select both source and destination vehicles",
        icon: "warning",
        confirmButtonColor: "#F38120",
      })
      return
    }

    if (selectedFromVehicle === selectedToVehicle) {
      Swal.fire({
        title: "Invalid Selection",
        text: "Source and destination vehicles cannot be the same",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
      return
    }

    const fromVehicle = fromVehicles.find((v) => v.value === selectedFromVehicle)
    const toVehicle = toVehicles.find((v) => v.value === selectedToVehicle)

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Confirm E-Tag Transfer Request",
      html: `
      <div class="text-left">
        <p class="mb-4"><strong>Request E-Tag transfer from:</strong></p>
        <div class="bg-green-50 p-3 rounded-lg mb-4 border border-green-200">
          <p class="font-semibold">${fromVehicle.label}</p>
          <p class="text-sm text-gray-600">E-Tag: ${fromVehicle.registrationNumber || "Available"}</p>
        </div>
        
        <p class="mb-4"><strong>To:</strong></p>
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p class="font-semibold">${toVehicle.label}</p>
          <p class="text-sm text-gray-600">Status: ${toVehicle.status || "Unregistered"}</p>
        </div>
        
        <p class="mt-4 text-sm text-gray-600">
          <strong>Note:</strong> This will create a request to transfer the E-Tag registration from the source vehicle to the destination vehicle.
        </p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F38120",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Submit Transfer Request",
      cancelButtonText: "Cancel",
    })

    if (!result.isConfirmed) return

    setTransferring(true)
    try {
      console.log("Submitting transfer request:", {
        oldVehicleId: selectedFromVehicle,
        newVehicleId: selectedToVehicle,
        amountIfCharged: 0,
      })

      // Call your E-Tag transfer request API
      const transferResponse = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/etag/request-transfer",
        {
          oldVehicleId: selectedFromVehicle,
          newVehicleId: selectedToVehicle,
          amountIfCharged: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Transfer request response:", transferResponse.data)

      Swal.fire({
        title: "Transfer Request Submitted!",
        html: `
        <div class="text-center">
          <p class="mb-4">Your E-Tag transfer request has been successfully submitted!</p>
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <p class="font-semibold text-green-800">Request ID: ${transferResponse.data.data?.id || "Generated"}</p>
            <p class="text-sm text-gray-600">From: ${fromVehicle.make} ${fromVehicle.model}</p>
            <p class="text-sm text-gray-600">To: ${toVehicle.make} ${toVehicle.model}</p>
          </div>
          <p class="mt-4 text-sm text-gray-600">
            Your request will be processed by the authorities. You will be notified once it's approved.
          </p>
        </div>
      `,
        icon: "success",
        confirmButtonColor: "#F38120",
      })

      // Reset selections and refresh data
      setSelectedFromVehicle("")
      setSelectedToVehicle("")
      fetchVehicleData()

      // Notify parent component
      if (onTransferInitiated) {
        onTransferInitiated()
      }
    } catch (error) {
      console.error("Error submitting transfer request:", error)
      Swal.fire({
        title: "Transfer Request Failed",
        text:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to submit transfer request. Please try again.",
        icon: "error",
        confirmButtonColor: "#F38120",
      })
    } finally {
      setTransferring(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-[#F38120] text-2xl mr-3" />
          <span className="text-gray-600">Loading vehicle data...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <FaExchangeAlt className="text-[#F38120] text-2xl mr-3" />
        <h2 className="text-2xl font-bold text-[#4A4D52]">E-Tag Transfer Request</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* From Vehicle Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#4A4D52] mb-2">
            <FaCar className="inline mr-2 text-[#F38120]" />
            From Vehicle (With E-Tag)
          </label>
          <select
            value={selectedFromVehicle}
            onChange={(e) => setSelectedFromVehicle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
            disabled={transferring}
          >
            <option value="">Select source vehicle...</option>
            {Array.isArray(fromVehicles) &&
              fromVehicles.map((vehicle) => (
                <option key={vehicle.value || vehicle.id} value={vehicle.value || vehicle.id}>
                  {vehicle.label || `${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
          </select>
          {(!Array.isArray(fromVehicles) || fromVehicles.length === 0) && (
            <p className="text-sm text-gray-500 mt-1">No vehicles with E-Tags available</p>
          )}
        </div>

        {/* To Vehicle Dropdown */}
        <div>
          <label className="block text-sm font-medium text-[#4A4D52] mb-2">
            <FaCar className="inline mr-2 text-[#F38120]" />
            To Vehicle (Without E-Tag)
          </label>
          <select
            value={selectedToVehicle}
            onChange={(e) => setSelectedToVehicle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120] focus:border-transparent"
            disabled={transferring}
          >
            <option value="">Select destination vehicle...</option>
            {Array.isArray(toVehicles) &&
              toVehicles.map((vehicle) => (
                <option key={vehicle.value || vehicle.id} value={vehicle.value || vehicle.id}>
                  {vehicle.label || `${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
          </select>
          {(!Array.isArray(toVehicles) || toVehicles.length === 0) && (
            <p className="text-sm text-gray-500 mt-1">No vehicles without E-Tags available</p>
          )}
        </div>
      </div>

      {/* Transfer Arrow and Button */}
      <div className="flex items-center justify-center mb-6">
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-[#F38120] text-2xl"
        >
          <FaArrowRight />
        </motion.div>
      </div>

      {/* Transfer Button */}
      <motion.button
        onClick={handleTransfer}
        disabled={!selectedFromVehicle || !selectedToVehicle || transferring}
        className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300 ${
          !selectedFromVehicle || !selectedToVehicle || transferring
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#F38120] hover:bg-[#DC5F00] hover:shadow-lg"
        }`}
        whileHover={!transferring && selectedFromVehicle && selectedToVehicle ? { scale: 1.02 } : {}}
        whileTap={!transferring && selectedFromVehicle && selectedToVehicle ? { scale: 0.98 } : {}}
      >
        {transferring ? (
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" />
            Submitting Request...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <FaExchangeAlt className="mr-2" />
            Submit Transfer Request
          </div>
        )}
      </motion.button>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>How it works:</strong> Select a vehicle with an E-Tag (source) and a vehicle without an E-Tag
              (destination). This will create a transfer request that needs to be approved by the authorities before the
              E-Tag is moved to the new vehicle.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VehicleTransferDropdown
