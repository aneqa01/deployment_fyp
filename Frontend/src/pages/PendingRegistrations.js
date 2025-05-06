"use client";

import { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaFilePdf, FaFile } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import SideNavBar from "../components/SideNavBar";
import TopNavBar from "../components/TopNavBar";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

/* =======================================================================
   DOCUMENT VIEWER COMPONENT
   ===================================================================== */
const DocumentViewer = ({ document }) => {
  const isPdf = document.mime === "application/pdf";
  const isImage = document.mime.startsWith("image/");

  if (isPdf) {
    return (
      <div className="w-32 h-32 flex flex-col items-center justify-center bg-gray-100 rounded shadow">
        <FaFilePdf className="text-red-500 text-3xl mb-2" />
        <a
          href={`data:${document.mime};base64,${document.b64}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline text-center px-2"
        >
          {document.name || "View PDF"}
        </a>
      </div>
    );
  }

  if (isImage) {
    return (
      <img
        src={`data:${document.mime};base64,${document.b64}`}
        alt={document.name || "Document"}
        className="w-32 h-32 object-cover rounded shadow"
      />
    );
  }

  return (
    <div className="w-32 h-32 flex flex-col items-center justify-center bg-gray-100 rounded shadow">
      <FaFile className="text-gray-500 text-3xl mb-2" />
      <a
        href={`data:${document.mime};base64,${document.b64}`}
        download={document.name || "document"}
        className="text-xs text-blue-600 hover:underline text-center px-2"
      >
        {document.name || "Download"}
      </a>
    </div>
  );
};

/* =======================================================================
   INSPECTION MODAL
   ===================================================================== */
const InspectionModal = ({ isOpen, onClose, vehicleId, onInspectionSent }) => {
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  useEffect(() => {
    if (isOpen) fetchOfficers();
  }, [isOpen]);

  const fetchOfficers = async () => {
    try {
      const res = await axios.get(
        "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/fetch-all-inspection-officers"
      );
      if (res.data?.data) setOfficers(res.data.data);
      else Swal.fire("Error", "Invalid response from server", "error");
    } catch {
      Swal.fire("Error", "Failed to fetch inspection officers", "error");
    }
  };

  const handleSubmitInspection = async () => {
    if (!selectedOfficer || !appointmentDate) {
      Swal.fire(
        "Validation",
        "Please select an officer and appointment date",
        "warning"
      );
      return;
    }

    try {
      await axios.post("https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/send-inspection-request", {
        VehicleId: vehicleId,
        OfficerId: selectedOfficer,
        AppointmentDate: appointmentDate,
      });

      Swal.fire("Success", "Inspection request sent!", "success");
      onInspectionSent?.(vehicleId);
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.error || "Failed to send inspection request",
        "error"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Book Inspection
        </h2>

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
          <button
            onClick={onClose}
            className="py-2 px-4 border rounded hover:bg-gray-100"
          >
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
  );
};

/* =======================================================================
   VEHICLE LIST ITEM
   ===================================================================== */
const VehicleListItem = ({
  vehicle,
  onBookInspection,
  inspectedVehicles = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleDetails = () => setIsExpanded((p) => !p);

  const isSent = inspectedVehicles.includes(vehicle.vehicleId);
  const isApproved =
    (vehicle.inspectionStatus || "").toLowerCase() === "approved";
  const hideButton = isSent || isApproved;

  return (
    <motion.li
      className="border-b border-gray-200 p-4 hover:bg-white hover:bg-opacity-20 transition-colors duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-[#373A40]">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-[#373A40]">Owner: {vehicle.FromUserName}</p>
        </div>

        <motion.button
          onClick={toggleDetails}
          className="text-[#373A40] hover:text-gray-900"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[#373A40]">Year: {vehicle.year}</p>
            <p className="text-[#373A40]">Color: {vehicle.color}</p>
            <p className="text-[#373A40]">Engine Number: {vehicle.engineNumber}</p>
            <p className="text-[#373A40]">Chassis Number: {vehicle.chassisNumber}</p>
            <p className="text-[#373A40]">Transaction Status: {vehicle.transactionStatus}</p>
            <p className="text-[#373A40]">
              Inspection Status: {vehicle.inspectionStatus || "Not Inspected"}
            </p>

            {/* ---------- DOCUMENT GALLERY ---------- */}
            {vehicle.documents?.length > 0 && (
              <>
                <p className="mt-4 font-semibold text-[#373A40]">Documents:</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {vehicle.documents.map((doc, idx) => (
                    <DocumentViewer key={idx} document={doc} />
                  ))}
                </div>
              </>
            )}

            {hideButton ? (
              <span className="mt-4 inline-block text-green-600 font-semibold">
                {isApproved ? "Approved" : "Sent for Inspection"}
              </span>
            ) : (
              <button
                onClick={() => onBookInspection(vehicle.vehicleId)}
                className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Send for Inspection
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

/* =======================================================================
   PENDING REGISTRATIONS
   ===================================================================== */
const PendingRegistrations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [modalVehicleId, setModalVehicleId] = useState(null);
  const [inspectedVehicles, setInspectedVehicles] = useState([]);

  const auth = useContext(AuthContext);
  const storedToken = localStorage.getItem("token");
  let decoded = null;
  try {
    decoded = storedToken ? jwtDecode(storedToken) : null;
  } catch {}
  const loggedInUserId = decoded?.id || decoded?.userId;

  useEffect(() => {
    const fetchPendingRegistrations = async () => {
      try {
        const { data } = await axios.get(
          "https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/transactions/pending"
        );

        /* ---------- helpers ---------- */
        const toBase64 = (fc) => {
          if (!fc) return null;
          if (typeof fc === "string") {
            return fc.includes(",") ? fc.split(",")[1] : fc;
          }
          if (Array.isArray(fc)) {
            try {
              return btoa(String.fromCharCode(...fc));
            } catch {
              return null;
            }
          }
          if (fc instanceof ArrayBuffer || fc.buffer instanceof ArrayBuffer) {
            const bytes = new Uint8Array(
              fc instanceof ArrayBuffer ? fc : fc.buffer
            );
            return btoa(String.fromCharCode(...bytes));
          }
          return null;
        };

        const guessMime = (row) => {
          const name =
            row.FileName ||
            row.OriginalName ||
            row.fileName ||
            row.originalName ||
            "";
          const ext = name.split(".").pop().toLowerCase();
          const m = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            webp: "image/webp",
            bmp: "image/bmp",
            pdf: "application/pdf",
          };
          return m[ext] || "application/octet-stream";
        };

        const toCamel = (r) => ({
          ...r,
          inspectionStatus:
            r.inspectionStatus ?? r.InspectionStatus ?? r.inspection_status,
          transactionStatus:
            r.transactionStatus ?? r.TransactionStatus ?? r.transaction_status,
        });

        /* ---------- build map keyed by vehicleId ---------- */
        const map = new Map();

        data.forEach((raw) => {
          const row = toCamel(raw);
          const existing = map.get(row.vehicleId) || { ...row, documents: [] };

          if (row.FileContent) {
            const b64 = toBase64(row.FileContent);
            if (b64) {
              existing.documents.push({
                b64,
                mime: guessMime(row),
                name:
                  row.FileName ||
                  row.OriginalName ||
                  `document-${existing.documents.length + 1}`,
              });
            }
          }

          existing.inspectionStatus =
            row.inspectionStatus || existing.inspectionStatus;
          existing.transactionStatus =
            row.transactionStatus || existing.transactionStatus;

          map.set(row.vehicleId, existing);
        });

        setPendingRegistrations([...map.values()]);
      } catch (err) {
        console.error("Error fetching pending registrations:", err);
        Swal.fire("Error", "Failed to fetch pending registrations", "error");
      }
    };

    fetchPendingRegistrations();
  }, []);

  const handleBookInspection = (vehicleId) => {
    setModalVehicleId(vehicleId);
    setShowInspectionModal(true);
  };
  const closeInspectionModal = () => {
    setModalVehicleId(null);
    setShowInspectionModal(false);
  };
  const handleInspectionSent = (vehicleId) => {
    setInspectedVehicles((prev) => [...prev, vehicleId]);
    setPendingRegistrations((prev) =>
      prev.map((v) =>
        v.vehicleId === vehicleId
          ? { ...v, inspectionStatus: "Sent for Inspection" }
          : v
      )
    );
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
          <motion.h1
            className="text-4xl font-bold text-[#F38120] mb-10 pt-16"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Pending Registrations
          </motion.h1>

          <motion.div
            className="bg-white bg-opacity-50 shadow-lg rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {pendingRegistrations.length === 0 ? (
              <motion.p
                className="text-center text-2xl font-semibold text-[#373A40] py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Loading...
              </motion.p>
            ) : (
              <ul className="divide-y divide-gray-200">
                <AnimatePresence>
                  {pendingRegistrations.map((vehicle) => (
                    <VehicleListItem
                      key={vehicle.vehicleId}
                      vehicle={vehicle}
                      onBookInspection={handleBookInspection}
                      inspectedVehicles={inspectedVehicles}
                    />
                  ))}
                </AnimatePresence>
              </ul>
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
  );
};

export default PendingRegistrations;
