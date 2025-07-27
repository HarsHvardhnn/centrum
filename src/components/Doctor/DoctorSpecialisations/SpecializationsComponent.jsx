import { useState, useRef, useEffect } from "react";

export default function SpecializationsComponent({ data }) {
  const [specializations, setSpecializations] = useState(
    data.specializations || []
  );
  const [newSpecialization, setNewSpecialization] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Lista popularnych specjalizacji do wyboru
  const commonSpecializations = [
    "Medycyna rodzinna",
    "Pediatria",
    "Kardiologia",
    "Dermatologia",
    "Neurologia",
    "Ortopedia",
    "Ginekologia",
    "Okulistyka",
    "Laryngologia",
    "Psychiatria",
    "Endokrynologia",
    "Urologia",
    "Chirurgia ogólna",
    "Alergologia",
    "Diabetologia",
    "Onkologia"
  ];

  // Filtrowanie specjalizacji na podstawie wprowadzonego tekstu
  const filteredSpecializations = newSpecialization.trim()
    ? commonSpecializations.filter(
        (spec) =>
          spec.toLowerCase().includes(newSpecialization.toLowerCase()) &&
          !specializations.includes(spec)
      )
    : commonSpecializations.filter((spec) => !specializations.includes(spec));

  // Zamknij dropdown po kliknięciu poza nim
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
      <h3 className="text-lg font-semibold mb-4">Specjalizacje</h3>

      {/* Wyświetl obecne specjalizacje */}
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
            Nie wybrano żadnych specjalizacji
          </span>
        )}
      </div>

      {/* Dodaj nową specjalizację z rozwijaną listą */}
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
              placeholder="Wpisz lub wybierz specjalizację"
            />

            {/* Menu rozwijane */}
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
                    Brak pasujących specjalizacji
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleAddSpecialization}
            className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary"
          >
            Dodaj
          </button>
        </div>
      </div>
    </section>
  );
}
