import React, { useState } from "react"
import { motion } from "framer-motion"
import { FaTimesCircle } from "react-icons/fa"

const RejectionModal = ({ isOpen, onClose, onConfirm, requestId }) => {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg text-gray-200 max-w-sm"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" />
          Reject Inspection
        </h2>
        <p>Please provide a reason for rejection:</p>
        <textarea
          className="w-full mt-2 p-2 text-black rounded-md"
          rows="3"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
        ></textarea>
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(requestId, reason)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
          >
            Reject
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default RejectionModal
