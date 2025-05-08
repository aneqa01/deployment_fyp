import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import axios from 'axios'; 
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';

const OwnershipTransfer = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedTransfer, setExpandedTransfer] = useState(null);
  const [disableHover, setDisableHover] = useState(false);  
  const [vehicles, setVehicles] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');  
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/signin');
  };

  useEffect(() => {
    const fetchPendingTransfers = async () => {
      try {
        const response = await axios.get('http://localhost:8085/api/transactions/pendingtransfers');
        const pendingTransfers = response.data;

        // Enrich each transfer with user details for CNIC and set initial status/registration number
        const enrichedTransfers = await Promise.all(
          pendingTransfers.map(async (vehicle) => {
            // Initially set status to "Pending" and registrationNumber "To be assigned"
            vehicle.status = 'Pending';
            vehicle.registrationNumber = 'To be assigned';

            // Fetch from-user details
            const fromUserRes = await axios.get(`http://localhost:8085/api/user/${vehicle.FromUserId}`);
            const fromUserData = fromUserRes.data;
            vehicle.FromUserCnic = fromUserData.cnic;

            // If ToUserId exists, fetch their details as well
            if (vehicle.ToUserId) {
              const toUserRes = await axios.get(`http://localhost:8085/api/user/${vehicle.ToUserId}`);
              const toUserData = toUserRes.data;
              vehicle.ToUserCnic = toUserData.cnic;
            } else {
              vehicle.ToUserCnic = 'Pending';
            }

            return vehicle;
          })
        );

        setVehicles(enrichedTransfers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pending transfers:', err);
        setError('Failed to load pending transfers.');
        setLoading(false);
      }
    };

    fetchPendingTransfers();
  }, []);

  const handleViewDetails = (vehicleId) => {
    setExpandedTransfer(expandedTransfer === vehicleId ? null : vehicleId);
    setDisableHover(!disableHover); 
  };

  const handleApprove = async (transactionId) => {
    const { value: registrationNumber } = await Swal.fire({
      title: 'Enter Registration Number',
      input: 'text',
      inputLabel: 'Registration Number',
      inputPlaceholder: 'Enter the new registration number for this vehicle',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a registration number!';
        }
      }
    });

    if (registrationNumber) {
      try {
        const response = await axios.post('http://localhost:8085/api/approveTransfer', 
          { transactionId }, 
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        Swal.fire({
          title: 'Transfer Accepted',
          text: response.data.msg,
          icon: 'success',
          confirmButtonText: 'OK',
        });

        // Update the vehicle's status and registrationNumber locally
        setVehicles(prev => prev.map(vehicle => 
          vehicle.TransactionId === transactionId
            ? { ...vehicle, status: 'Approved', registrationNumber }
            : vehicle
        ));

        // Fetch from and to user details to send emails
        const approvedVehicle = vehicles.find(v => v.TransactionId === transactionId);
        if (approvedVehicle) {
          const fromUserRes = await axios.get(`http://localhost:8085/api/user/${approvedVehicle.FromUserId}`);
          const fromUserData = fromUserRes.data;

          // Send email to from-user
          await axios.post('http://localhost:8085/api/send-email', {
            to: fromUserData.email,
            subject: 'Ownership Transfer Approved',
            data: {
              user: fromUserData.name,
              action: 'ownership transfer',
              vehicle: approvedVehicle.make + " " + approvedVehicle.model,
              status: 'approved'
            }
          });

          if (approvedVehicle.ToUserId) {
            const toUserRes = await axios.get(`http://localhost:8085/api/user/${approvedVehicle.ToUserId}`);
            const toUserData = toUserRes.data;

            // Send email to to-user
            await axios.post('http://localhost:8085/api/send-email', {
              to: toUserData.email,
              subject: 'Ownership Transfer Approved',
              data: {
                user: toUserData.name,
                action: 'ownership transfer',
                vehicle: approvedVehicle.make + " " + approvedVehicle.model,
                status: 'approved'
              }
            });
          }
        }

      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.msg || 'Failed to approve the transfer.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  const handleReject = async (transactionId) => {
    try {
      const response = await axios.post('http://localhost:8085/api/rejectTransfer', 
        { transactionId }, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      Swal.fire({
        title: 'Transfer Rejected',
        text: response.data.msg,
        icon: 'success',
        confirmButtonText: 'OK',
      });

      // Update the vehicle's status locally
      setVehicles(prev => prev.map(vehicle => 
        vehicle.TransactionId === transactionId
          ? { ...vehicle, status: 'Rejected', registrationNumber: 'To be assigned' }
          : vehicle
      ));

      // Fetch from and to user details to send emails
      const rejectedVehicle = vehicles.find(v => v.TransactionId === transactionId);
      if (rejectedVehicle) {
        const fromUserRes = await axios.get(`http://localhost:8085/api/user/${rejectedVehicle.FromUserId}`);
        const fromUserData = fromUserRes.data;

        // Send email to from-user
        await axios.post('http://localhost:8085/api/send-email', {
          to: fromUserData.email,
          subject: 'Ownership Transfer Rejected',
          data: {
            user: fromUserData.name,
            action: 'ownership transfer',
            vehicle: rejectedVehicle.make + " " + rejectedVehicle.model,
            status: 'rejected'
          }
        });

        if (rejectedVehicle.ToUserId) {
          const toUserRes = await axios.get(`http://localhost:8085/api/user/${rejectedVehicle.ToUserId}`);
          const toUserData = toUserRes.data;

          // Send email to to-user
          await axios.post('http://localhost:8085/api/send-email', {
            to: toUserData.email,
            subject: 'Ownership Transfer Rejected',
            data: {
              user: toUserData.name,
              action: 'ownership transfer',
              vehicle: rejectedVehicle.make + " " + rejectedVehicle.model,
              status: 'rejected'
            }
          });
        }
      }

    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.msg || 'Failed to reject the transfer.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      <TopNavBar toggleNav={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar
          logout={handleLogout}
          navOpen={sidebarOpen}
          toggleNav={() => setSidebarOpen(!sidebarOpen)}
          userRole="user"
        />

        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-10 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F38120] to-[#F3A620] text-center">
              Ownership Transfer Approvals
            </h1>
          </motion.div>

          {loading ? (
            <p>Loading pending transfers...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <motion.ul
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              {vehicles.map((vehicle) => (
                <motion.li 
                  key={vehicle.TransactionId} 
                  className="border border-gray-300 p-4 bg-white bg-opacity-30 rounded-lg"
                  whileHover={disableHover ? {} : { scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p><strong>From:</strong> {vehicle.FromUserName} (CNIC: {vehicle.FromUserCnic})</p>
                      <p><strong>To:</strong> {vehicle.ToUserName || 'Pending'} {vehicle.ToUserCnic ? `(CNIC: ${vehicle.ToUserCnic})` : ''}</p>
                      <p><strong>Status:</strong> {vehicle.status}</p>
                      <p><strong>Registration Number:</strong> {vehicle.registrationNumber}</p>
                    </div>
                    <motion.button
                      className="bg-[#F38120] text-white px-4 py-2 rounded"
                      onClick={() => handleViewDetails(vehicle.TransactionId)}
                      whileHover={disableHover ? {} : { scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {expandedTransfer === vehicle.TransactionId ? 'Hide Details' : 'View Details'}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {expandedTransfer === vehicle.TransactionId && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold">Vehicle Details:</h3>
                        <p><strong>Year:</strong> {vehicle.year}</p>
                        <p><strong>Color:</strong> {vehicle.color}</p>
                        <p><strong>Chassis Number:</strong> {vehicle.chassisNumber}</p>
                        <p><strong>Engine Number:</strong> {vehicle.engineNumber}</p>
                        <p><strong>Registration Date:</strong> {new Date(vehicle.registrationDate).toLocaleDateString()}</p>

                        {vehicle.status === 'Pending' && (
                          <div className="mt-4 flex space-x-4">
                            <motion.button
                              className="bg-[#F38120] text-white px-4 py-2 rounded hover:bg-[#DC5F00] transition-all"
                              onClick={() => handleApprove(vehicle.TransactionId)}
                              whileHover={disableHover ? {} : { scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Accept
                            </motion.button>
                            <motion.button
                              className="bg-[#F38120] text-white px-4 py-2 rounded hover:bg-[#C24A00] transition-all"
                              onClick={() => handleReject(vehicle.TransactionId)}
                              whileHover={disableHover ? {} : { scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Reject
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default OwnershipTransfer;
