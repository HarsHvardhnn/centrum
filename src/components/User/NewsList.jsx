import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";

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
        <p className="text-gray-600 mt-2">{article.description}</p>
        <div className="flex justify-between items-center mt-4">
          <Link
            to={`/user/news/single/${article._id}`}
            className="text-main max-sm:text-sm px-6 py-2 rounded-full bg-main-light transition"
          >
            Read More »
          </Link>
        </div>
      </div>
    </div>
  );
};

const NewsList = ({ isNews }) => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 10;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiCaller("GET", `/news?isNews=${isNews}`);
        setNewsData(response.data);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : newsData.length > 0 ? (
        <>
          {currentArticles.map((article) => (
            <NewsCard key={article._id} article={article} />
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
            nextLinkClassName={
              "px-4 py-2 border rounded-lg bg-teal-600 text-white"
            }
            disabledClassName={"opacity-50"}
            activeClassName={"text-main"}
            pageLinkClassName={
              "px-4 py-2 border rounded-lg hover:bg-teal-600 hover:text-white transition"
            }
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-xl">No posts available</p>
        </div>
      )}
    </div>
  );
};

export default NewsList;
