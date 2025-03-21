import React, { useState } from "react";
import { ArrowLeft, Search, Filter, Plus } from "lucide-react";

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
      <div className="flex justify-between items-center space-y-4">
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
            <p className="text-gray-medium">Showing: {subtitle}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Search by email or name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
            Filter
          </button>

          <button
            onClick={onAddDoctor}
            className="ml-4 px-4 py-2 bg-primary text-white rounded-lg flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Doctor
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter by Doctor */}
              <div className="space-y-2">
                <h3 className="font-medium">Filter by Doctor</h3>
                <input
                  type="text"
                  placeholder="Doctor name"
                  value={filters.doctor}
                  onChange={(e) =>
                    handleFilterChange("doctor", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <select
                  value={filters.specialty}
                  onChange={(e) =>
                    handleFilterChange("specialty", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Specialties</option>
                  {filterOptions.specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <label htmlFor="availability" className="flex items-center">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={filters.availability}
                    onChange={(e) =>
                      handleFilterChange("availability", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Show only available doctors
                </label>
              </div>

              {/* Filter by Appointment */}
              <div className="space-y-2">
                <h3 className="font-medium">Filter by Appointment</h3>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  {filterOptions.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.visitType}
                  onChange={(e) =>
                    handleFilterChange("visitType", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Visit Types</option>
                  {filterOptions.visitTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset and Apply Filters */}
              <div className="flex items-end space-x-2">
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
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    onFilter && onFilter(filters);
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
