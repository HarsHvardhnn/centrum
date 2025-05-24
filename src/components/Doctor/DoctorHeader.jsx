import React, { useState } from "react";
import { ArrowLeft, Search, Filter, Plus } from "lucide-react";
import RoleAccess from "../UtilComponents/RoleAccess";

const Header = ({
  title,
  subtitle,
  onBack,
  onSearch,
  onFilter,
  onAddDoctor,
  filterOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    doctor: "",
    specialty: "",
    availability: false,
    date: "",
    status: "",
    visitType: "",
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch && onSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="flex flex-col space-y-4">
        {/* Header with title and actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={24} className="text-gray-dark" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-dark">{title}</h1>
              <p className="text-gray-medium">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj po emailu lub imieniu"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center bg-white text-gray-dark"
            >
              <Filter size={20} className="mr-2" />
              Filtruj
            </button>

            <RoleAccess allowedRoles={["admin","receptionist"]}>
              <button
                onClick={onAddDoctor}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Dodaj specjalistę
              </button>
            </RoleAccess>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm mt-2">
            <div className="flex flex-wrap">
              {/* Filter by Doctor */}
              <div className="w-full md:w-1/2 px-4">
                <h3 className="text-lg font-medium mb-4">Filtruj według specjalisty</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Imię specjalisty"
                      value={filters.doctor}
                      onChange={(e) =>
                        handleFilterChange("doctor", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <select
                      value={filters.specialty}
                      onChange={(e) =>
                        handleFilterChange("specialty", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                    >
                      <option value="">Wszystkie specjalności</option>
                      {filterOptions?.specialties?.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="availability"
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id="availability"
                        checked={filters.availability}
                        onChange={(e) =>
                          handleFilterChange("availability", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span>Pokaż tylko dostępnych Lekarzy</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Filter by Appointment */}
              <div className="w-full md:w-1/2 px-4">
                <h3 className="text-lg font-medium mb-4">
                  Filtruj według wizyty
                </h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) =>
                        handleFilterChange("date", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                    >
                      <option value="">Wszystkie statusy</option>
                      {filterOptions?.statuses?.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={filters.visitType}
                      onChange={(e) =>
                        handleFilterChange("visitType", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                    >
                      <option value="">Wszystkie typy wizyt</option>
                      {filterOptions?.visitTypes?.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => {
                  setFilters({
                    doctor: "",
                    specialty: "",
                    availability: false,
                    date: "",
                    status: "",
                    visitType: "",
                  });
                  onFilter && onFilter({});
                }}
                className="px-6 py-2 border border-gray-300 rounded-md bg-white"
              >
                Resetuj
              </button>
              <button
                onClick={() => {
                  onFilter && onFilter(filters);
                  setShowFilters(false);
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-md"
              >
                Zastosuj filtry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
