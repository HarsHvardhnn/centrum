// src/components/AppointmentForm/PatientSearchField.jsx
import { useState, useRef, useEffect } from 'react';
import PatientDropdown from './PatientDropDown';

const PatientSearchField = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const patients = [
    { id: '#85736738', name: 'Demi Wilkinson', username: '@demi', age: 70, sex: 'Male', avatar: '/avatars/demi1.jpg' },
    { id: '38', name: 'Phoenix Baker', username: '@phoenix', age: 39, sex: 'Male', avatar: '/avatars/phoenix.jpg' },
    { id: '38', name: 'Demi Wilkinson', username: '@demi', age: 36, sex: 'Male', avatar: '/avatars/demi2.jpg' },
    { id: '38', name: 'Lana Steiner', username: '@lana', age: 36, sex: 'Male', avatar: '/avatars/lana.jpg' },
    { id: '38', name: 'Demi Wilkinson', username: '@demi', age: 36, sex: 'Male', avatar: '/avatars/demi3.jpg' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSelect = (patient) => {
    setSearchTerm(`${patient.name} (${patient.id})`);
    setIsDropdownOpen(false);
    onPatientSelect(patient);
  };

  return (
    <div ref={dropdownRef} className="relative mb-4">
      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Patient name</label>
      <input
        id="search"
        type="text"
        placeholder="Enter patient name & number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleInputFocus}
        className="w-full p-3 pr-[50px] border rounded-md focus:outline-none focus:ring-teal-500"
      />
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="absolute right-[10px] top-[10px] p-[5px] bg-teal-light rounded-md"
      >
        🔍
      </button>

      {/* Dropdown */}
      <PatientDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onSelect={handleSelect}
        patients={patients}
      />
    </div>
  );
};

export default PatientSearchField;
