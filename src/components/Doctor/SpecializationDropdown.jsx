import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

// Specialization dropdown component
export default function SpecializationDropdown({
  values,
  setFieldValue,
  errors,
  touched,
  specializations = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter specializations based on search term
  const filteredSpecializations = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selecting a specialization
  const handleSelectSpecialization = (specialization) => {
    // Check if the specialization ID is already selected
    if (!values.specialization.some((item) => item.id === specialization._id)) {
      const updatedSpecializations = [
        ...values.specialization,
        { id: specialization._id, name: specialization.name },
      ];
      setFieldValue("specialization", updatedSpecializations);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  // Handle removing a specialization
  const handleRemoveSpecialization = (index) => {
    const updatedSpecializations = values.specialization.filter(
      (_, i) => i !== index
    );
    setFieldValue("specialization", updatedSpecializations);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Specialization*
      </label>

      {/* Dropdown container */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            placeholder="Search specializations..."
          />
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-300">
            {filteredSpecializations.length > 0 ? (
              filteredSpecializations.map((spec) => (
                <div
                  key={spec._id}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer"
                  onClick={() => handleSelectSpecialization(spec)}
                >
                  {spec.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">
                No specializations found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected specializations */}
      {values.specialization.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.specialization.map((spec, index) => (
            <span
              key={index}
              className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-sm flex items-center"
            >
              {spec.name || spec}
              <button
                type="button"
                onClick={() => handleRemoveSpecialization(index)}
                className="ml-1 text-teal-700 hover:text-teal-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Error message */}
      {errors.specialization && touched.specialization && (
        <div className="text-red-500 text-xs mt-1">{errors.specialization}</div>
      )}
    </div>
  );
}
