import React from "react";

const PageHeader = ({ title, path, bgurl }) => {
  return (
    <div
      className="h-[420px] pt-28 px-40 flex flex-col justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgurl})` }}
    >
      <div className="absolute inset-0 bg-main-lighter bg-opacity-70"></div>

      <div className="relative z-10">
        <h4 className="text-lg text-main">{path}</h4>
        <h2 className="text-5xl font-semibold text-main font-serif">{title}</h2>
      </div>
    </div>
  );
};

export default PageHeader;
