"use client"

import React, { useContext, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronDown, FaChevronUp, FaFile, FaSpinner, FaImage } from "react-icons/fa"
import axios from "axios"
import Swal from "sweetalert2"
import SideNavBar from "../components/SideNavBar"
import TopNavBar from "../components/TopNavBar"
import { AuthContext } from "../context/AuthContext"
import { jwtDecode } from "jwt-decode"

/* =======================================================================
   LAZY IMAGE COMPONENT - For better performance with large images
   ===================================================================== */
const LazyImage = ({ src, alt, className, vehicleId, index }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [loadStarted, setLoadStarted] = useState(false)

  // Only start loading when component is visible
  const imageRef = React.useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadStarted) {
          setLoadStarted(true)
        }
      },
      { threshold: 0.1 },
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current)
      }
    }
  }, [loadStarted])

  return (
    <div ref={imageRef} className={`relative ${className || "w-32 h-32"} bg-gray-100 rounded overflow-hidden`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          {loadStarted ? (
            <FaSpinner className="animate-spin text-gray-400 text-xl" />
          ) : (
            <FaImage className="text-gray-300 text-xl" />
          )}
        </div>
      )}

      {loadStarted && (
        <img
          src={src || "/placeholder.svg"}
          alt={alt || `Document ${index} for vehicle ${vehicleId}`}
          className={`w-full h-full object-cover ${loaded ? "block" : "hidden"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <span className="text-red-500 text-xs text-center p-2">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

/* =======================================================================
   DOCUMENT THUMBNAIL - Optimized for performance
   ===================================================================== */
const DocumentThumbnail = ({ document, vehicleId, index, onClick }) => {
  // Function to get image source with compression hints
  const getImageSrc = useCallback(() => {
    try {
      if (!document || !document.FileContent) {
        return null
      }

      // If it's already a string (possibly base64)
      if (typeof document.FileContent === "string") {
        if (document.FileContent.startsWith("data:")) {
          return document.FileContent // Already a data URL
        }
        return `data:image/jpeg;base64,${document.FileContent}`
      }

      // If it's an array (byte array)
      if (Array.isArray(document.FileContent)) {
        // For very large arrays, we'll create a thumbnail on demand when clicked
        if (document.FileContent.length > 1000000) {
          // More than ~1MB
          return null // Will show placeholder instead
        }

        // For smaller arrays, convert to base64
        let binary = ""
        const bytes = new Uint8Array(document.FileContent)
        const chunkSize = 1024

        // Process in chunks to avoid call stack issues
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, i + chunkSize)
          binary += String.fromCharCode.apply(null, chunk)
        }

        const base64 = btoa(binary)
        return `data:image/jpeg;base64,${base64}`
      }

      return null
    } catch (err) {
      console.error("Error creating image source:", err)
      return null
    }
  }, [document])

  const imageSrc = getImageSrc()
  const isLargeFile =
    document?.FileContent &&
    ((Array.isArray(document.FileContent) && document.FileContent.length > 1000000) ||
      (typeof document.FileContent === "string" && document.FileContent.length > 1000000))

  return (
    <div className="relative cursor-pointer transform transition-transform hover:scale-105" onClick={onClick}>
      {imageSrc ? (
        <LazyImage
          src={imageSrc}
          vehicleId={vehicleId}
          index={index}
          className="w-24 h-24 sm:w-32 sm:h-32 shadow-md rounded"
        />
      ) : isLargeFile ? (
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center bg-blue-50 rounded shadow-md">
          <FaImage className="text-blue-400 text-2xl mb-1" />
          <span className="text-xs text-center text-gray-600">Large Image</span>
          <span className="text-xs text-center text-gray-500">Click to view</span>
        </div>
      ) : (
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-gray-100 rounded shadow-md">
          <FaFile className="text-gray-400 text-3xl" />
        </div>
      )}
    </div>
  )
}

/* =======================================================================
   IMAGE VIEWER MODAL - For viewing full images on demand
   ===================================================================== */
const ImageViewerModal = ({ isOpen, onClose, document, vehicleId }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    if (isOpen && document) {
      setIsLoading(true)
      setError(null)

      try {
        // Process the image on demand when modal is opened
        if (typeof document.FileContent === "string") {
          if (document.FileContent.startsWith("data:")) {
            setImageSrc(document.FileContent)
          } else {
            setImageSrc(`data:image/jpeg;base64,${document.FileContent}`)
          }
          setIsLoading(false)
        } else if (Array.isArray(document.FileContent)) {
          // For large arrays, process in a Web Worker or in chunks
          setTimeout(() => {
            try {
              let binary = ""
              const bytes = new Uint8Array(document.FileContent)
              const chunkSize = 1024

              // Process in chunks with setTimeout to avoid blocking UI
              const processChunk = (start) => {
                const end = Math.min(start + chunkSize, bytes.length)
                for (let i = start; i < end; i++) {
                  binary += String.fromCharCode(bytes[i])
                }

                if (end < bytes.length) {
                  // Process next chunk in next tick
                  setTimeout(() => processChunk(end), 0)
                } else {
                  // All chunks processed
                  try {
                    const base64 = btoa(binary)
                    setImageSrc(`data:image/jpeg;base64,${base64}`)
                    setIsLoading(false)
                  } catch (e) {
                    console.error("Error in base64 encoding:", e)
                    setError("Failed to process image data")
                    setIsLoading(false)
                  }
                }
              }

              // Start processing first chunk
              processChunk(0)
            } catch (e) {
              console.error("Error processing image chunks:", e)
              setError("Failed to process large image")
              setIsLoading(false)
            }
          }, 100)
        } else {
          setError("Unsupported document format")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error in image processing:", err)
        setError("Failed to process image")
        setIsLoading(false)
      }
    }
  }, [isOpen, document])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10"
        >
          &times;
        </button>

        <div className="p-4 bg-gray-100 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Document for Vehicle #{vehicleId}</h3>
        </div>

        <div className="flex items-center justify-center p-4 bg-gray-800 h-[70vh] overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <FaSpinner className="animate-spin text-white text-4xl mb-4" />
              <p className="text-white">Processing large image...</p>
              <p className="text-gray-300 text-sm mt-2">This may take a moment for large files</p>
            </div>
          ) : error ? (
            <div className="text-center text-white">
              <p className="text-red-400 text-xl mb-2">⚠️ {error}</p>
              <p className="text-gray-300">The image could not be processed</p>
            </div>
          ) : imageSrc ? (
            <img
              src={imageSrc || "/placeholder.svg"}
              alt={`Document for vehicle ${vehicleId}`}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-white text-center">
              <FaFile className="mx-auto text-6xl mb-4" />
              <p>No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =======================================================================
   INSPECTION MODAL (UNCHANGED)
   ===================================================================== */
const InspectionModal = ({ isOpen, onClose, vehicleId, onInspectionSent }) => {
  const [officers, setOfficers] = useState([])
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")

  useEffect(() => {
    if (isOpen) fetchOfficers()
  }, [isOpen])

  const fetchOfficers = async () => {
    try {
      const res = await axios.get("http://localhost:8085/api/fetch-all-inspection-officers")
      if (res.data?.data) setOfficers(res.data.data)
      else Swal.fire("Error", "Invalid response from server", "error")
    } catch {
      Swal.fire("Error", "Failed to fetch inspection officers", "error")
    }
  }

  const handleSubmitInspection = async () => {
    if (!selectedOfficer || !appointmentDate) {
      Swal.fire("Validation", "Please select an officer and appointment date", "warning")
      return
    }

    try {
      await axios.post("http://localhost:8085/api/send-inspection-request", {
        VehicleId: vehicleId,
        OfficerId: selectedOfficer,
        AppointmentDate: appointmentDate,
      })

      Swal.fire("Success", "Inspection request sent!", "success")
      onInspectionSent?.(vehicleId)
      onClose()
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.error || "Failed to send inspection request", "error")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Book Inspection</h2>

        <label htmlFor="officerSelect" className="block mb-1 font-medium">
          Select Officer:
        </label>
        <select
          id="officerSelect"
          className="border p-2 w-full mb-4"
          value={selectedOfficer}
          onChange={(e) => setSelectedOfficer(e.target.value)}
        >
          <option value="">-- Choose an Officer --</option>
          {officers.map((o) => (
            <option key={o.UserId} value={o.UserId}>
              {o.Name} ({o.Email})
            </option>
          ))}
        </select>

        <label htmlFor="appointmentDate" className="block mb-1 font-medium">
          Appointment Date:
        </label>
        <input
          id="appointmentDate"
          type="date"
          className="border p-2 w-full mb-4"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
        />

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="py-2 px-4 border rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSubmitInspection}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

/* =======================================================================
   VEHICLE LIST ITEM
   ===================================================================== */
const VehicleListItem = ({ vehicle, onBookInspection, inspectedVehicles = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const toggleDetails = () => setIsExpanded((p) => !p)

  const isSent = inspectedVehicles.includes(vehicle.vehicleId)
  const isApproved = (vehicle.inspectionStatus || "").toLowerCase() === "approved"
  const hideButton = isSent || isApproved

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc)
    setIsImageModalOpen(true)
  }

  // Determine if vehicle has documents
  const hasDocuments = vehicle.FileContent || (vehicle.documents && vehicle.documents.length > 0)

  return (
    <>
      <motion.li
        className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-4 bg-white">
          <div>
            <h3 className="font-semibold text-[#373A40] text-lg">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-[#373A40] text-sm">Owner: {vehicle.FromUserName}</p>
          </div>

          <motion.button
            onClick={toggleDetails}
            className="text-[#373A40] hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-4 pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[#373A40]">
                    <span className="font-medium">Year:</span> {vehicle.year}
                  </p>
                  <p className="text-[#373A40]">
                    <span className="font-medium">Color:</span> {vehicle.color}
                  </p>
                  <p className="text-[#373A40]">
                    <span className="font-medium">Engine Number:</span> {vehicle.engineNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[#373A40]">
                    <span className="font-medium">Chassis Number:</span> {vehicle.chassisNumber}
                  </p>
                  <p className="text-[#373A40]">
                    <span className="font-medium">Transaction Status:</span> {vehicle.transactionStatus}
                  </p>
                  <p className="text-[#373A40]">
                    <span className="font-medium">Inspection Status:</span>{" "}
                    {vehicle.inspectionStatus || "Not Inspected"}
                  </p>
                </div>
              </div>

              {/* ---------- DOCUMENT GALLERY (OPTIMIZED) ---------- */}
              <div className="mt-4">
                <h4 className="font-semibold text-[#373A40] mb-2">Documents:</h4>

                {hasDocuments ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* If the vehicle has FileContent directly */}
                    {vehicle.FileContent && (
                      <DocumentThumbnail
                        document={vehicle}
                        vehicleId={vehicle.vehicleId}
                        index={0}
                        onClick={() => handleDocumentClick(vehicle)}
                      />
                    )}

                    {/* If the vehicle has documents array */}
                    {vehicle.documents &&
                      vehicle.documents.map((doc, idx) => (
                        <DocumentThumbnail
                          key={idx}
                          document={doc}
                          vehicleId={vehicle.vehicleId}
                          index={idx}
                          onClick={() => handleDocumentClick(doc)}
                        />
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No documents available</p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                {hideButton ? (
                  <span className="inline-block text-green-600 font-semibold bg-green-50 px-4 py-2 rounded">
                    {isApproved ? "Approved" : "Sent for Inspection"}
                  </span>
                ) : (
                  <button
                    onClick={() => onBookInspection(vehicle.vehicleId)}
                    className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors shadow-sm hover:shadow"
                  >
                    Send for Inspection
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.li>

      <ImageViewerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        document={selectedDocument}
        vehicleId={vehicle.vehicleId}
      />
    </>
  )
}

/* =======================================================================
   PENDING REGISTRATIONS
   ===================================================================== */
const PendingRegistrations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [modalVehicleId, setModalVehicleId] = useState(null)
  const [inspectedVehicles, setInspectedVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Show fewer items per page to improve performance

  const auth = useContext(AuthContext)
  const storedToken = localStorage.getItem("token")
  let decoded = null
  try {
    decoded = storedToken ? jwtDecode(storedToken) : null
  } catch {}
  const loggedInUserId = decoded?.id || decoded?.userId

  useEffect(() => {
    fetchPendingRegistrations()
  }, [])

  const fetchPendingRegistrations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await axios.get("http://localhost:8085/api/transactions/pending")

      // Set the data directly without heavy processing
      setPendingRegistrations(data)
    } catch (err) {
      console.error("Error fetching pending registrations:", err)
      setError("Failed to fetch pending registrations")
      Swal.fire("Error", "Failed to fetch pending registrations", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookInspection = (vehicleId) => {
    setModalVehicleId(vehicleId)
    setShowInspectionModal(true)
  }

  const closeInspectionModal = () => {
    setModalVehicleId(null)
    setShowInspectionModal(false)
  }

  const handleInspectionSent = (vehicleId) => {
    setInspectedVehicles((prev) => [...prev, vehicleId])
    setPendingRegistrations((prev) =>
      prev.map((v) => (v.vehicleId === vehicleId ? { ...v, inspectionStatus: "Sent for Inspection" } : v)),
    )
  }

  // Pagination logic
  const totalPages = Math.ceil(pendingRegistrations.length / itemsPerPage)
  const currentItems = pendingRegistrations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="governmentOfficial"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10">
          <motion.h1
            className="text-4xl font-bold text-[#F38120] mb-10 pt-16"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Pending Registrations
          </motion.h1>

          <motion.div
            className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FaSpinner className="animate-spin text-orange-500 text-4xl mb-4" />
                <p className="text-gray-600">Loading pending registrations...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
                <button
                  onClick={fetchPendingRegistrations}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : pendingRegistrations.length === 0 ? (
              <motion.p
                className="text-center text-2xl font-semibold text-[#373A40] py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                No pending registrations found
              </motion.p>
            ) : (
              <>
                <AnimatePresence>
                  <ul>
                    {currentItems.map((vehicle) => (
                      <VehicleListItem
                        key={vehicle.vehicleId}
                        vehicle={vehicle}
                        onBookInspection={handleBookInspection}
                        inspectedVehicles={inspectedVehicles}
                      />
                    ))}
                  </ul>
                </AnimatePresence>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <div className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>
      </div>

      <InspectionModal
        isOpen={showInspectionModal}
        onClose={closeInspectionModal}
        vehicleId={modalVehicleId}
        onInspectionSent={handleInspectionSent}
      />
    </div>
  )
}

export default PendingRegistrations
