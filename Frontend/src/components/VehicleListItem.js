// src/components/VehicleListItem.js
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const VehicleListItem = ({ vehicle, owner }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <li className="bg-white bg-opacity-20 rounded-lg shadow-md mb-4 overflow-hidden">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={toggleDetails}>
        <div>
          <h3 className="font-semibold text-[#373A40]">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-[#373A40]">Owner: {owner.name}</p>
        </div>
        <button className="text-[#373A40] hover:text-[#F38120]">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <p className="text-[#373A40]">
            <strong>Year:</strong> {vehicle.manufactureYear}
          </p>
          <p className="text-[#373A40]">
            <strong>Registration Date:</strong> {vehicle.registrationDate}
          </p>
          <p className="text-[#373A40]">
            <strong>Engine Number:</strong> {vehicle.engineNumber}
          </p>
          <p className="text-[#373A40]">
            <strong>License Plate:</strong> {vehicle.licensePlate}
          </p>
          <p className="text-[#373A40]">
            <strong>Color:</strong> {vehicle.color}
          </p>
          <p className="text-[#373A40]">
            <strong>Chassis Number:</strong> {vehicle.chassisNumber}
          </p>
        </div>
      )}
    </li>
  );
};

export default VehicleListItem;
