import React from "react";
import StatCard from "./StatCard";
import { Calendar, Bed, Stethoscope, Activity } from "lucide-react";

const StatsDashboard = () => {
  // Dane dla kart statystyk
  const statsData = [
    {
      icon: <Calendar size={24} />,
      count: 165,
      label: "Wizyty"
    },
    {
      icon: <Bed size={24} />,
      count: 102,
      label: "Nowo przyjęci"
    },
    {
      icon: <Stethoscope size={24} />,
      count: 4,
      label: "Zabiegi"
    },
    {
      icon: <Activity size={24} />,
      count: 54,
      label: "Pacjenci krytyczni"
    }
  ];

  return (
    <div className="flex items-center gap-3">
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
