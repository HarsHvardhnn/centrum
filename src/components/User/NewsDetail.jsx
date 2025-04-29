import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import { apiCaller } from "../../utils/axiosInstance";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiCaller("GET", `/news/${id}`);
        setNews(response.data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        navigate("/user/news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, navigate]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (!news) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white px-4 rounded-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 bg-teal-800 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
      >
        ← Back
      </button>
      <img
        src={news.image}
        alt={news.title}
        className="w-full h-64 sm:h-96 object-cover mb-2"
      />

      <h1 className="text-2xl sm:text-3xl font-bold mb-4">{news.title}</h1>

      <p className="text-gray-500 text-sm mb-1">
        {news.date} <GoDotFill className="inline text-main" /> {news.author}
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">{news.description}</p>

      <div className="flex gap-4 text-sm text-gray-600">
        <span>👁️ {news.views}</span>
        <span>❤️ {news.likes}</span>
      </div>
    </div>
  );
};

export default NewsDetail;
