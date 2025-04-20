import React, { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";

export default function FullScreenLoader() {
  const [progress, setProgress] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 8) + 1;
        return prev + increment > 100 ? 100 : prev + increment;
      });
    }, 400);

    const pulseInterval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.3 : 1));
    }, 700);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center">
          <div
            className="text-teal-500 transition-transform duration-500 ease-in-out"
            style={{ transform: `scale(${pulseScale})` }}
          >
            <HeartPulse size={40} />
          </div>
        </div>

        {/* Circular progress */}
        <svg
          className="absolute -top-4 -left-4 -right-4 -bottom-4 w-32 h-32"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            transform="rotate(-90 50 50)"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>
    </div>
  );
}
