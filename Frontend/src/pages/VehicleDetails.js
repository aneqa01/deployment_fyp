import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const VehicleDetails = () => {
    const { vehicleId } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("🚀 Vehicle Details Page Loaded. Vehicle ID from URL:", vehicleId);

    useEffect(() => {
        if (!vehicleId) {
            console.error("❌ Vehicle ID is missing in URL!");
            setError("Vehicle ID is missing.");
            setLoading(false);
            return;
        }

        const fetchVehicleDetails = async () => {
            console.log("📡 Fetching Vehicle Details for ID:", vehicleId);

            try {
                const response = await axios.get(`https://api-securechain-fcf7cnfkcebug3em.westindia-01.azurewebsites.net/api/vehicleById`, {
                    params: { vehicleId }
                });

                console.log("✅ API Response:", response.data);

                if (response.data && typeof response.data === "object" && response.data._id) {
                    setVehicle(response.data);
                } else {
                    console.warn("⚠ No valid vehicle details found.");
                    setError("Vehicle details not found.");
                }
            } catch (err) {
                console.error("❌ Error fetching vehicle details:", err);
                setError("Failed to fetch vehicle details");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicleDetails();
    }, [vehicleId]);

    if (loading) return <p className="text-center text-blue-400">Loading vehicle details...</p>;
    if (error) return <p className="text-center text-red-400">{error}</p>;

    console.log("🎉 Vehicle details successfully loaded:", vehicle);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl bg-opacity-20 backdrop-blur-xl shadow-xl border border-gray-700 rounded-3xl p-8"
            >
                <h2 className="text-4xl font-extrabold text-center mb-6 text-gray-100">🚀 Vehicle Details</h2>
                {vehicle ? (
                    <div className="grid grid-cols-2 gap-6 p-6 rounded-xl">
                        <p className="text-lg"><span className="text-blue-400">🔹 ID:</span> {vehicle._id || "N/A"}</p>
                        <p className="text-lg"><span className="text-yellow-400">👤 Owner ID:</span> {vehicle.ownerId || "N/A"}</p>
                        <p className="text-lg"><span className="text-green-400">🏷 Make:</span> {vehicle.make || "N/A"}</p>
                        <p className="text-lg"><span className="text-purple-400">🚘 Model:</span> {vehicle.model || "N/A"}</p>
                        <p className="text-lg"><span className="text-pink-400">📅 Year:</span> {vehicle.year || "N/A"}</p>
                        <p className="text-lg"><span className="text-indigo-400">🎨 Color:</span> {vehicle.color || "N/A"}</p>
                        <p className="text-lg"><span className="text-red-400">🔩 Chassis #:</span> {vehicle.chassisNumber || "N/A"}</p>
                        <p className="text-lg"><span className="text-cyan-400">🔧 Engine #:</span> {vehicle.engineNumber || "N/A"}</p>
                        <p className="text-lg col-span-2 text-center">
                            <span className="text-gray-300">📌 Status:</span>
                            <span className={`ml-2 px-4 py-2 rounded-lg text-lg font-semibold 
                                ${vehicle.status === "Registered" ? "bg-green-500 text-white" 
                                : vehicle.status === "Unregistered" ? "bg-yellow-500 text-black" 
                                : "bg-red-500 text-white"}`}>
                                {vehicle.status || "N/A"}
                            </span>
                        </p>
                    </div>
                ) : (
                    <p className="text-center text-red-400">No vehicle data available.</p>
                )}
            </motion.div>
        </div>
    );
};

export default VehicleDetails;
