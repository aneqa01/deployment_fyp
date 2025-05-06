import React from "react"
import { motion } from "framer-motion"
import { FaCheckCircle } from "react-icons/fa"

const ApprovalModal = ({ isOpen, onClose, onConfirm, requestId }) => {
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
          <FaCheckCircle className="text-green-500 mr-2" />
          Approve Inspection
        </h2>
        <p>Are you sure you want to approve this inspection request?</p>
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(requestId)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md"
          >
            Approve
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ApprovalModal
