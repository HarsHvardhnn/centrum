import React from "react";

const StatCard = ({ icon, count, label }) => {
  return (
    <div className="bg-[#E6F4F4] rounded-lg  h-[124px] w-[145.5px] flex flex-col items-center justify-center border-[0.85px] border-[#CCE8E8]">
      <div className="text-[#7dd3c8] mb-3">
        {icon}
      </div>
      <h2 className="text-3xl font-bold mb-1">{count}</h2>
      <p className="text-gray-700">{label}</p>
    </div>
  );
};

export default StatCard;
