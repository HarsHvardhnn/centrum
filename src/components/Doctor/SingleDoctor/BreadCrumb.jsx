import React from "react";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items = [] }) => {
  return (
    <div className="flex items-center">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={16} className="mx-2 text-gray-400" />
          )}
          <span
            className={`${
              index === items.length - 1
                ? "text-gray-700 font-medium"
                : "text-gray-500 hover:text-teal-500 cursor-pointer"
            }`}
            onClick={() => item.onClick && item.onClick()}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
