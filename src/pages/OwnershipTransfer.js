"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import axios from "axios"
import { FaCar, FaMoneyBillWave, FaFileInvoiceDollar, FaSearch, FaPlus } from "react-icons/fa"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"

const ChallanGeneration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [pendingTransfers, setPendingTransfers] = useState([])
  const [filteredTransfers, setFilteredTransfers] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    amount: "",
    type: "OwnershipTransfer", // ✅ Default value set to OwnershipTransfer
    description: "",
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/signin")
  }

  // Fetch pending transfers with vehicle and user details
  useEffect(() => {
    const fetchPendingTransfers = async () => {
      try {
        const response = await axios.get(
          "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions/pendingtransfers",
        )
        const pendingTransfers = response.data

        // Enrich each transfer with user details and vehicle details
        const enrichedTransfers = await Promise.all(
          pendingTransfers.map(async (transfer) => {
            try {
              // Fetch from-user details (current owner)
              const fromUserRes = await axios.get(
                `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/user/${transfer.FromUserId}`,
              )
              const fromUserData = fromUserRes.data
              transfer.FromUserCnic = fromUserData.cnic
              transfer.FromUserName = fromUserData.name
              transfer.FromUserEmail = fromUserData.email

              // Fetch vehicle details
              const vehicleRes = await axios.get(
                `https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicleById?vehicleId=${transfer.VehicleId}`,
              )
              const vehicleData = vehicleRes.data

              // Combine transfer and vehicle data
              transfer.vehicleDetails = {
                vehicleId: transfer.VehicleId,
                registrationNumber: vehicleData.registrationNumber,
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.manufactureYear || vehicleData.year,
                color: vehicleData.color,
                chassisNumber: vehicleData.chassisNumber,
                engineNumber: vehicleData.engineNumber,
                ownerId: transfer.FromUserId,
                ownerDetails: fromUserData,
              }

              return transfer
            } catch (error) {
              console.error("Error fetching details for transfer:", transfer.TransactionId, error)
              return null
            }
          }),
        )

        // Filter out any failed transfers
        const validTransfers = enrichedTransfers.filter((transfer) => transfer !== null)
        setPendingTransfers(validTransfers)
        setFilteredTransfers(validTransfers)
      } catch (error) {
        console.error("Error fetching pending transfers:", error)
        Swal.fire({
          title: "Error",
          text: "Failed to fetch pending transfers",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    }

    fetchPendingTransfers()
  }, [])

  // Search vehicles by registration number or owner CNIC
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredTransfers(pendingTransfers)
      return
    }

    setSearchLoading(true)
    try {
      const filtered = pendingTransfers.filter(
        (transfer) =>
          transfer.vehicleDetails?.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.FromUserCnic?.includes(searchQuery) ||
          transfer.FromUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.vehicleDetails?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.vehicleDetails?.model?.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (filtered.length === 0) {
        Swal.fire({
          title: "No Vehicles Found",
          text: "No pending transfer vehicles found for the provided search criteria",
          icon: "info",
          confirmButtonText: "OK",
        })
      }

      setFilteredTransfers(filtered)
    } catch (error) {
      console.error("Search error:", error)
      Swal.fire({
        title: "Search Error",
        text: "Error occurred while searching vehicles",
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleVehicleSelect = (transfer) => {
    setSelectedVehicle({
      ...transfer.vehicleDetails,
      transferDetails: {
        transactionId: transfer.TransactionId,
        transferFee: transfer.TransferFee,
        requestDate: transfer.RequestDate,
      },
    })

    // ✅ Auto-fill description when vehicle is selected
    setFormData((prev) => ({
      ...prev,
      description: `Ownership Transfer Challan - ${transfer.vehicleDetails?.registrationNumber} - ${transfer.vehicleDetails?.make} ${transfer.vehicleDetails?.model}`,
    }))
  }

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

    if (!selectedVehicle) {
      newErrors.vehicle = "Please select a vehicle from pending transfers"
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(formData.amount) || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }

    // Type is always OwnershipTransfer, so no validation needed

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
      const challanData = {
        vehicleId: selectedVehicle.vehicleId,
        amount: Number.parseFloat(formData.amount),
        type: "OwnershipTransfer", // ✅ Always send OwnershipTransfer
        description: formData.description || `Ownership Transfer Challan - ${selectedVehicle.registrationNumber}`,
      }

      const response = await axios.post(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/createChallan",
        challanData,
      )

      if (response.status === 201) {
        Swal.fire({
          title: "Ownership Transfer Challan Generated!",
          html: `
            <div class="text-left">
              <p><strong>Vehicle:</strong> ${selectedVehicle.make} ${selectedVehicle.model}</p>
              <p><strong>Registration:</strong> ${selectedVehicle.registrationNumber}</p>
              <p><strong>Owner:</strong> ${selectedVehicle.ownerDetails.name}</p>
              <p><strong>CNIC:</strong> ${selectedVehicle.ownerDetails.cnic}</p>
              <p><strong>Amount:</strong> PKR ${formData.amount}</p>
              <p><strong>Type:</strong> Ownership Transfer</p>
              <p><strong>Status:</strong> Pending Transfer</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Reset form but keep type as OwnershipTransfer
          setFormData({
            amount: "",
            type: "OwnershipTransfer",
            description: "",
          })
          setSelectedVehicle(null)
          setSearchQuery("")
        })
      }
    } catch (error) {
      console.error("Error creating challan:", error)
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to generate challan",
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetSearch = () => {
    setSearchQuery("")
    setSelectedVehicle(null)
    setFilteredTransfers(pendingTransfers)
    // Reset form but keep type as OwnershipTransfer
    setFormData({
      amount: "",
      type: "OwnershipTransfer",
      description: "",
    })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="admin"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <div className="container mx-auto px-6 py-8 max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-[#F38120] text-center mb-2">
                Generate Ownership Transfer Challan
              </h1>
              <p className="text-center text-gray-600">
                Issue ownership transfer challans to vehicles with pending transfers
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vehicle Search & Selection */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-[#4A4D52] mb-6 flex items-center">
                  <FaSearch className="mr-3 text-[#F38120]" />
                  Pending Transfer Vehicles
                </h2>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by registration, CNIC, owner name, or vehicle make/model"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120]"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <motion.button
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className="px-6 py-3 bg-[#F38120] text-white rounded-lg hover:bg-[#DC5F00] transition-colors disabled:bg-gray-400"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {searchLoading ? "..." : <FaSearch />}
                    </motion.button>
                    <motion.button
                      onClick={resetSearch}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reset
                    </motion.button>
                  </div>
                </div>

                {/* Vehicle List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredTransfers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No pending transfer vehicles found</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredTransfers.map((transfer) => (
                        <motion.div
                          key={transfer.TransactionId}
                          onClick={() => handleVehicleSelect(transfer)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedVehicle?.vehicleId === transfer.VehicleId
                              ? "border-[#F38120] bg-orange-50"
                              : "border-gray-200 hover:border-[#F38120] hover:bg-gray-50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-[#4A4D52]">
                                {transfer.vehicleDetails?.make} {transfer.vehicleDetails?.model}
                              </p>
                              <p className="text-sm text-gray-600">
                                Registration: {transfer.vehicleDetails?.registrationNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Owner: {transfer.FromUserName} ({transfer.FromUserCnic})
                              </p>
                              <p className="text-sm text-gray-600">Year: {transfer.vehicleDetails?.year}</p>
                              <div className="mt-2">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  🔄 Pending Transfer
                                </span>
                              </div>
                            </div>
                            {selectedVehicle?.vehicleId === transfer.VehicleId && (
                              <div className="text-[#F38120]">
                                <FaCar />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.vehicle && <p className="text-red-500 text-sm mt-2">{errors.vehicle}</p>}
              </motion.div>

              {/* Challan Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-[#4A4D52] mb-6 flex items-center">
                  <FaFileInvoiceDollar className="mr-3 text-[#F38120]" />
                  Ownership Transfer Challan
                </h2>

                {/* Selected Vehicle Info */}
                {selectedVehicle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <h3 className="font-semibold text-[#4A4D52] mb-2">Selected Vehicle</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Vehicle:</span>
                        <p className="font-medium">
                          {selectedVehicle.make} {selectedVehicle.model}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Registration:</span>
                        <p className="font-medium">{selectedVehicle.registrationNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Owner:</span>
                        <p className="font-medium">{selectedVehicle.ownerDetails?.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">CNIC:</span>
                        <p className="font-medium">{selectedVehicle.ownerDetails?.cnic}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          🔄 Pending Transfer
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ✅ Challan Type - Fixed to OwnershipTransfer */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D52] mb-2">
                      <FaFileInvoiceDollar className="inline mr-2 text-[#F38120]" />
                      Challan Type
                    </label>
                    <input
                      type="text"
                      value="Ownership Transfer"
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This page is specifically for ownership transfer challans
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D52] mb-2">
                      <FaMoneyBillWave className="inline mr-2 text-[#F38120]" />
                      Transfer Fee Amount (PKR)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter ownership transfer fee"
                      min="1"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120] ${
                        errors.amount ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A4D52] mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Ownership transfer challan description"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38120]"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || !selectedVehicle}
                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300 ${
                      loading || !selectedVehicle
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#F38120] hover:bg-[#DC5F00] hover:shadow-lg"
                    }`}
                    whileHover={!loading && selectedVehicle ? { scale: 1.02 } : {}}
                    whileTap={!loading && selectedVehicle ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Challan...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaPlus className="mr-2" />
                        Generate Ownership Transfer Challan
                      </div>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Info Notice */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
            >
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
                    <strong>Note:</strong> This system generates ownership transfer challans for vehicles with pending
                    transfers. The challan must be paid by the current owner before the transfer can be completed.
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

export default ChallanGeneration
