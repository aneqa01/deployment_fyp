import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';


import TopNavBar from '../components/TopNavBar';
import SideNavBar from '../components/SideNavBar';

const DocumentUpload = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // Stores uploaded documents
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const navigate = useNavigate();

  // Retrieve VehicleId from localStorage on component mount
  useEffect(() => {
    const storedVehicleId = localStorage.getItem('vehicleId');
    if (!storedVehicleId) {
      setError('Vehicle ID is missing or invalid. Please register a vehicle first.');
      navigate('/user-vehicle-register');
    } else {
      setVehicleId(storedVehicleId);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Clear previous errors when a new file is selected
  };

  const handleDocumentTypeChange = (e) => {
    setSelectedDocumentType(e.target.value);
    setError(null); // Clear previous errors when a new type is selected
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedDocumentType || !file) {
      setError('Please select a document type and upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('vehicleId', vehicleId); // Add vehicleId to the form data
    formData.append('documentType', selectedDocumentType);
    formData.append('file', file);

    try {
      const response = await axios.post('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/uploadDocument', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setUploadedDocuments((prev) => [
          ...prev,
          { documentType: selectedDocumentType, fileName: file.name },
        ]);
        setSuccess(`Document (${selectedDocumentType}) uploaded successfully!`);
        setSelectedDocumentType('');
        setFile(null); // Reset form after successful upload
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    }
  };

  const handleSubmitAll = async () => {
    try {
      const response = await axios.post('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/submitAllDocuments', {
        vehicleId,
        documents: uploadedDocuments,
      });

      if (response.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'All documents have been submitted successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        setUploadedDocuments([]);
        navigate('/user-dashboard'); // Redirect after successful submission
      }
    } catch (err) {
      console.error('Error submitting all documents:', err);
      setError('Failed to submit all documents. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="user"
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-5 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] text-center">
              Upload Vehicle Documents
            </h1>
          </motion.div>

          <motion.form
            onSubmit={handleUpload}
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-2xl rounded-2xl p-6 max-w-4xl mx-auto flex-grow flex flex-col justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                Select Document Type
              </label>
              <select
                id="documentType"
                name="documentType"
                value={selectedDocumentType}
                onChange={handleDocumentTypeChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-[#F38120] focus:border-[#F38120] transition-all duration-300 bg-[#EEEEEE] bg-opacity-50"
                required
              >
                <option value="">Choose Document Type</option>
                <option value="CNIC">CNIC</option>
                <option value="Driving License">Driving License</option>
                <option value="Vehicle Registration Card">Vehicle Registration Card</option>
                <option value="University Card">University Card</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <input
                type="file"
                id="fileUpload"
                name="fileUpload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 bg-[#EEEEEE] bg-opacity-50 border-2 border-gray-300 rounded-lg focus:ring-[#F38120] focus:border-[#F38120] transition-all duration-300"
                required
              />
            </div>

            <motion.div
              className="mt-6 flex justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#F38120] to-[#F3A620] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
              >
                Upload Document
              </button>
            </motion.div>
          </motion.form>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-700">Uploaded Documents</h2>
            <ul className="list-disc list-inside mt-2">
              {uploadedDocuments.map((doc, index) => (
                <li key={index} className="text-gray-700">
                  {doc.documentType} - {doc.fileName}
                </li>
              ))}
            </ul>
          </div>

          {uploadedDocuments.length > 0 && (
            <motion.div
              className="mt-6 flex justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleSubmitAll}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
              >
                Submit All Documents
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p>{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DocumentUpload;
