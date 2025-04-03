import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { Eye, Heart } from "lucide-react";
import newsData from "../../utils/UserSideData/newsData";
import { Link } from "react-router-dom";

const NewsCard = ({ article }) => {
  return (
    <div className="bg-white overflow-hidden mb-6">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-64 sm:h-96 object-cover"
      />
      <div className="py-5">
        <div className="text-xs sm:text-sm text-gray-500 flex gap-4 items-center">
          <span>{article.date}</span>
          <span>{article.author}</span>
          <span className="flex items-center">
            <Eye className="size-3 sm:size-4 lg:size-5 mr-1" /> {article.views}
          </span>
          <span className="flex items-center">
            <Heart className="size-3 sm:size-4 lg:size-5 mr-1 text-red-500" />{" "}
            {article.likes}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-main mt-2">
          {article.title}
        </h2>
        <p className="text-gray-600 mt-2">{article.paragraph}</p>
        <div className="flex justify-between items-center mt-4">
          <Link
            to={`/user/news/${article.id}`}
            className="text-main max-sm:text-sm px-6 py-2 rounded-full bg-main-light transition"
          >
            Read More »
          </Link>
        </div>
      </div>
    </div>
  );
};

const NewsList = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 10;

  const pageCount = Math.ceil(newsData.length / articlesPerPage);
  const currentArticles = newsData.slice(
    currentPage * articlesPerPage,
    (currentPage + 1) * articlesPerPage
  );

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      {currentArticles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}

      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        pageCount={pageCount}
        onPageChange={handlePageClick}
        containerClassName={"pagination flex justify-center space-x-2 mt-6"}
        previousLinkClassName={
          "px-4 py-2 border rounded-lg bg-teal-600 text-white"
        }
        nextLinkClassName={"px-4 py-2 border rounded-lg bg-teal-600 text-white"}
        disabledClassName={"opacity-50"}
        activeClassName={"text-main"}
        pageLinkClassName={
          "px-4 py-2 border rounded-lg hover:bg-teal-600 hover:text-white transition"
        }
      />
    </div>
  );
};

export default NewsList;
