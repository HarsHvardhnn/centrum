// PatientSearchField.jsx
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
    <div ref={dropdownRef} className="relative">
      <div className="mb-2 text-sm font-medium">Patient name</div>
      <div className="flex">
        <input
          id="search"
          type="text"
          placeholder="Enter patient name & number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-xs"
          style={{
            borderColor: '#D0D5DD',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
          }}
        />
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="ml-2 w-12 h-12 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: '#4EBFB4' }}
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* Dropdown - positioned relative to the parent container */}
      <div className="relative w-full">
        <PatientDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onSelect={handleSelect}
          patients={patients}
        />
      </div>
    </div>
  );
};

export default PatientSearchField;
