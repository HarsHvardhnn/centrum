import React from "react";

const PageHeader = ({ title, path, bgurl }) => {
  return (
    <div
      className="h-[250px] md:h-[350px] lg:h-[420px] pt-20 md:pt-28 px-6 md:px-20 lg:px-40 flex flex-col justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgurl})` }}
    >
      <div className="absolute inset-0 bg-main-lighter bg-opacity-70"></div>

      <div className="relative z-10 text-center md:text-left">
        <h4 className="text-sm md:text-lg text-main">{path}</h4>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-main font-serif">
          {title?.replace(/-/g, " ")}
        </h2>
      </div>
    </div>
  );
};

export default PageHeader;
