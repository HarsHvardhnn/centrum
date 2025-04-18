import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Data based on the chart in the image
const chartData = [
  { month: "Jan", series1: 300, series2: 200, series3: 300 },
  { month: "Feb", series1: 350, series2: 250, series3: 400 },
  { month: "Mar", series1: 200, series2: 150, series3: 250 },
  { month: "Apr", series1: 300, series2: 250, series3: 350 },
  { month: "May", series1: 350, series2: 300, series3: 300 },
  { month: "Jun", series1: 350, series2: 250, series3: 300 },
  { month: "Jul", series1: 400, series2: 350, series3: 250 },
  { month: "Aug", series1: 300, series2: 250, series3: 200 },
];

export default function DoctorAppointmentChart() {
  const [selectedMonth] = useState("Month");

  // Calculate max chart height for proper scaling
  const getMaxTotal = () => {
    return Math.max(
      ...chartData.map((item) => item.series1 + item.series2 + item.series3)
    );
  };

  const maxTotal = getMaxTotal();

  return (
    <div className="bg-white rounded-lg shadow-sm w-full max-w-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          Doctor Appointment
        </h2>
        <div className="relative">
          <button className="flex items-center bg-white border border-gray-200 rounded-md px-4 py-2">
            <span className="text-sm text-gray-600 mr-2">{selectedMonth}</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Highlighted month info */}
      <div className="mb-6">
        <div className="inline-block bg-teal-50 rounded-md px-3 py-2">
          <span className="text-sm text-gray-700 mr-2">September</span>
          <span className="text-sm font-semibold text-gray-800">20k</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <div className="w-2 h-2.rounded-full bg-teal-500 mr-2"></div>
          <span className="text-xs text-gray-500">Series 1</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2.rounded-full bg-teal-300 mr-2"></div>
          <span className="text-xs text-gray-500">Series 2</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2.rounded-full bg-teal-200 mr-2"></div>
          <span className="text-xs text-gray-500">Series 3</span>
        </div>
      </div>

      {/* Y-axis labels */}
      <div className="relative mt-8">
        <div className="absolute -left-8 -top-6 text-xs text-gray-500">
          1000
        </div>
        <div className="absolute -left-6 top-16 text-xs text-gray-500">600</div>
        <div className="absolute -left-6 top-32 text-xs text-gray-500">200</div>
        <div className="absolute -left-4 top-48 text-xs text-gray-500">0</div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-48 mb-2 relative">
        <div className="absolute -left-16 h-full flex flex-col justify-between">
          <span className="text-xs text-gray-500">Active doctor</span>
        </div>

        {chartData.map((item, index) => {
          const totalHeight = 192; // 48rem in pixels
          const series1Height = (item.series1 / maxTotal) * totalHeight * 0.8;
          const series2Height = (item.series2 / maxTotal) * totalHeight * 0.8;
          const series3Height = (item.series3 / maxTotal) * totalHeight * 0.8;

          return (
            <div key={index} className="flex flex-col items-center w-full">
              <div className="w-12 flex flex-col-reverse">
                <div
                  className="bg-teal-600 w-full"
                  style={{ height: `${series1Height}px` }}
                ></div>
                <div
                  className="bg-teal-400 w-full"
                  style={{ height: `${series2Height}px` }}
                ></div>
                <div
                  className="bg-teal-200 w-full"
                  style={{ height: `${series3Height}px` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{item.month}</div>
            </div>
          );
        })}
      </div>

      {/* X-axis label */}
      <div className="text-xs text-gray-500 text-center mt-2">Month</div>
    </div>
  );
}
