import React from "react";
import StatCard from "./StatCard";
import { Calendar, Bed, Stethoscope, Activity } from "lucide-react";

const StatsDashboard = () => {
  // Data for the stats cards
  const statsData = [
    {
      icon: <Calendar size={24} />,
      count: 165,
      label: "Appointment"
    },
    {
      icon: <Bed size={24} />,
      count: 102,
      label: "New Admitted"
    },
    {
      icon: <Stethoscope size={24} />,
      count: 4,
      label: "Surgery"
    },
    {
      icon: <Activity size={24} />,
      count: 54,
      label: "Critical Patient"
    }
  ];

  return (
    <div className="flex items-center justify-evenly">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          count={stat.count}
          label={stat.label}
        />
      ))}
    </div>
  );
};

export default StatsDashboard;
