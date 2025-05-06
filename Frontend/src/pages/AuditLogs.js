import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCarAlt, FaUser, FaClock, FaExchangeAlt } from 'react-icons/fa';
import SideNavBar from '../components/SideNavBar';
import TopNavBar from '../components/TopNavBar';

const TransactionCard = ({ transaction, onPreview }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden h-full"
      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(243, 129, 32, 0.3)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-[#4A4D52] mb-4">{transaction.transactionType}</h3>
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">From</h4>
            <div className="flex items-center">
              <FaUser className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{transaction.FromUserName}</span>
            </div>
          </div>
          {transaction.ToUserName && (
            <div>
              <h4 className="font-semibold text-[#F38120] mb-1">To</h4>
              <div className="flex items-center">
                <FaUser className="text-[#F38120] mr-2" />
                <span className="text-gray-600">{transaction.ToUserName}</span>
              </div>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Vehicle</h4>
            <div className="flex items-center">
              <FaCarAlt className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{`${transaction.make} ${transaction.model} (${transaction.year})`}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#F38120] mb-1">Timestamp</h4>
            <div className="flex items-center">
              <FaClock className="text-[#F38120] mr-2" />
              <span className="text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Preview PDF Button */}
        <div className="mt-4 flex justify-end">
          <button
            className="bg-[#F38120] text-white px-4 py-2 rounded hover:bg-[#DC5F00] transition-all duration-300 text-sm font-semibold"
            onClick={() => onPreview(transaction)}
          >
            Preview PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewTransaction, setPreviewTransaction] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(true); // Toggle state
  const [isGenerating, setIsGenerating] = useState(false); // For spinner

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions');
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handlePreviewPDF = (transaction) => {
    setPreviewTransaction(transaction);
  };

  const handleDownloadPDF = async (transactionId) => {
    setIsGenerating(true);
    try {
      const response = await axios.post(
        'https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/generateTransactionPDF',
        { transactionId },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `transaction-${transactionId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error generating transaction PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAllPDFs = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.get('https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/generateAllTransactionsPDF', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'all-transactions.pdf';
      link.click();
    } catch (error) {
      console.error('Error generating all transactions PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold text-[#F38120]">Transactions</h1>
              <div className="flex items-center">
                <label className="mr-3 font-semibold">View:</label>
                <select
                  className="bg-white border border-gray-300 rounded px-4 py-2"
                  value={showAllTransactions ? 'all' : 'pdf'}
                  onChange={(e) => setShowAllTransactions(e.target.value === 'all')}
                >
                  <option value="all">All Transactions</option>
                  <option value="pdf">Download All PDFs</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-lg text-gray-600">Loading transactions...</div>
            ) : showAllTransactions ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                <AnimatePresence>
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction.TransactionId}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TransactionCard transaction={transaction} onPreview={handlePreviewPDF} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <button
                className="bg-[#F38120] text-white px-6 py-3 rounded hover:bg-[#DC5F00] transition-all duration-300 mx-auto block"
                onClick={handleDownloadAllPDFs}
              >
                {isGenerating ? 'Generating PDF...' : 'Download All PDFs'}
              </button>
            )}
          </div>
        </main>
      </div>

      {previewTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Transaction Preview</h2>
            <p><strong>From:</strong> {previewTransaction.FromUserName}</p>
            {previewTransaction.ToUserName && <p><strong>To:</strong> {previewTransaction.ToUserName}</p>}
            <p><strong>Vehicle:</strong> {`${previewTransaction.make} ${previewTransaction.model}`}</p>
            <p><strong>Status:</strong> {previewTransaction.transactionStatus}</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={() => setPreviewTransaction(null)}
              >
                Close
              </button>
              <button
                className="bg-[#F38120] text-white px-4 py-2 rounded"
                onClick={() => {
                  setPreviewTransaction(null);
                  handleDownloadPDF(previewTransaction.TransactionId);
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
