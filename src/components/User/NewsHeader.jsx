import React from "react";
import { Link } from "react-router-dom";
import { GoDotFill } from "react-icons/go";

const NewsHeader = ({ news }) => {
  return (
    <div
      className="h-[300px] md:h-[400px] lg:h-[420px] pt-20 md:pt-28 px-6 md:px-20 lg:px-40 flex flex-col justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("/images/newsHeader.jpg")` }}
    >
      <div className="absolute inset-0 bg-main-lighter bg-opacity-70"></div>

      <div className="relative z-10 text-center md:text-left">
        <nav className="text-sm md:text-lg text-main">
          <Link to="/" className="hover:underline">
            Strona główna
          </Link>{" "}
          /
          <Link to="/news" className="hover:underline">
            {" "}
            Aktualności
          </Link>{" "}
          /<span> {news.category}</span>
        </nav>

        <h1
          title={news.title}
          className="text-2xl md:text-4xl pb-1 lg:text-5xl font-semibold text-main font-serif truncate"
        >
          {news.title}
        </h1>

        <div className="flex flex-wrap justify-center md:justify-start items-center text-xs md:text-sm text-gray-500 mt-2">
          <span>{news.date}</span>
          <GoDotFill className="mx-1 md:mx-2 text-gray-400" />
          <span>{news.author}</span>
          <GoDotFill className="mx-1 md:mx-2 text-gray-400" />
          <span>{news.views} wyświetleń</span>
          <GoDotFill className="mx-1 md:mx-2 text-gray-400" />
          <span>{news.likes} polubień</span>
        </div>
      </div>
    </div>
  );
};

export default NewsHeader;
