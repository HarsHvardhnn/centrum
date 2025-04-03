import React, { useEffect } from "react";
import newsData from "../../utils/UserSideData/newsData";
import { GoDotFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import NewsHeader from "./NewsHeader";

const NewsDetail = ({ newsId }) => {
  const navigate = useNavigate();
  const newsIndex = newsData.findIndex((n) => n.id === Number(newsId));
  const news = newsData[newsIndex];

  useEffect(() => {
    if (!news) {
      navigate("/user/news");
    }
  }, [news, navigate]);

  if (!news) {
    return null;
  }

  const prevNews = newsData[newsIndex - 1];
  const nextNews = newsData[newsIndex + 1];

  return (
    <div className="max-w-3xl mx-auto bg-white px-4 rounded-lg">
      <img
        src={news.image}
        alt={news.title}
        className="w-full h-64 sm:h-96 object-cover mb-2"
      />

      <p className="text-gray-700 leading-relaxed mb-2 sm:mb-6 sm:p-4">{news.paragraph}</p>

      <div className="flex justify-between p-2">
        {prevNews ? (
          <button
            onClick={() => navigate(`/user/news/${prevNews.id}`)}
            className="px-6 py-2 bg-main-light max-sm:text-sm text-main rounded-full"
          >
            Previous Article
          </button>
        ) : (
          <span />
        )}
        {nextNews ? (
          <button
            onClick={() => navigate(`/user/news/${nextNews.id}`)}
            className="px-6 py-2 bg-main-light max-sm:text-sm text-main rounded-full"
          >
            Next Article
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
