// BreadcrumbNav.jsx
import React from "react";
import { ArrowLeft } from "lucide-react";

const BreadcrumbNav = ({ patientName, navigate }) => {
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center mb-6 text-sm text-[#80c5c5] font-medium ">
      <button onClick={handleGoBack} className=" mr-2">
        <ArrowLeft size={18} />
      </button>
      <span
        className="cursor-pointer"
        onClick={() => navigate("/lekarze/wizyty")}
      >
        Wizyty lekarskie
      </span>
      <span className="mx-2">/</span>
      <span
        className="cursor-pointer"
        onClick={() => navigate("/szczegoly-pacjenta")}
      >
        Szczegóły pacjenta
      </span>
      <span className="mx-2">/</span>
      <span className="text-gray-600">{patientName}</span>
    </div>
  );
};

export default BreadcrumbNav;
