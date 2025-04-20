import { useState, useRef, useEffect } from "react";

export default function SpecializationsComponent({ data }) {
  const [specializations, setSpecializations] = useState(
    data.specializations || []
  );
  const [newSpecialization, setNewSpecialization] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Sample list of common specializations that could be selected
  const commonSpecializations = [
    "Web Development",
    "Mobile Apps",
    "UI/UX Design",
    "Data Science",
    "Cloud Solutions",
    "DevOps",
    "AI/ML",
    "Blockchain",
    "E-commerce",
    "Digital Marketing",
    "SEO",
    "Content Creation",
    "Social Media",
    "Graphic Design",
    "Video Production",
    "Photography",
  ];

  // Filter specializations based on input
  const filteredSpecializations = newSpecialization.trim()
    ? commonSpecializations.filter(
        (spec) =>
          spec.toLowerCase().includes(newSpecialization.toLowerCase()) &&
          !specializations.includes(spec)
      )
    : commonSpecializations.filter((spec) => !specializations.includes(spec));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !specializations.includes(newSpecialization)
    ) {
      setSpecializations([...specializations, newSpecialization]);
      setNewSpecialization("");
      setIsDropdownOpen(false);
    }
  };

  const handleSelectSpecialization = (spec) => {
    if (!specializations.includes(spec)) {
      setSpecializations([...specializations, spec]);
      setNewSpecialization("");
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveSpecialization = (specToRemove) => {
    setSpecializations(specializations.filter((spec) => spec !== specToRemove));
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Specializations</h3>

      {/* Display current specializations */}
      <div className="flex flex-wrap gap-2 mb-6">
        {specializations.map((spec, idx) => (
          <span
            key={idx}
            className="border bg-white text-sm px-4 py-1 rounded-full flex items-center"
          >
            {spec}
            <button
              onClick={() => handleRemoveSpecialization(spec)}
              className="ml-2 text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
        {specializations.length === 0 && (
          <span className="text-gray-500 text-sm">
            No specializations selected
          </span>
        )}
      </div>

      {/* Add new specialization with dropdown */}
      <div className="mb-6 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newSpecialization}
              onChange={(e) => {
                setNewSpecialization(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter or select a specialization"
            />

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 border rounded bg-white shadow-lg z-10 max-h-64 overflow-y-auto"
              >
                {filteredSpecializations.length > 0 ? (
                  <ul>
                    {filteredSpecializations.map((spec, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectSpecialization(spec)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {spec}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No matching specializations
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleAddSpecialization}
            className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}
