import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { apiCaller } from "../../utils/axiosInstance";
import DOMPurify from "dompurify";
import { generateNewsSlug } from "../../utils/slugUtils";

const NewsCard = ({ article }) => {
  const truncateHTML = (html, maxLength) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = DOMPurify.sanitize(html);
    const text = div.textContent || div.innerText;
    if (text.length <= maxLength) return html;
    return text.slice(0, maxLength).trim() + '...';
  };

  const sanitizedDescription = article.shortDescription || truncateHTML(article.description, 200);

  // Helper function to get valid slug for the link
  const getValidSlug = (article) => {
    // If slug exists and is not empty, use it
    if (article.slug && article.slug.trim() !== '') {
      return article.slug;
    }
    
    // If no slug, generate one from title
    if (article.title) {
      return generateNewsSlug(article.title);
    }
    
    // Fallback to _id if both slug and title are missing
    return article._id || 'undefined-article';
  };

  const validSlug = getValidSlug(article);

  // Don't render the link if we don't have a valid slug
  if (!validSlug || validSlug === 'undefined-article') {
    console.error('Cannot create link: Invalid article data', article);
    return (
      <div className="bg-white overflow-hidden mb-6">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-64 sm:h-96 object-cover"
        />
        <div className="py-5">
          <div className="text-xs sm:text-sm text-gray-500 flex gap-4 items-center">
            <span>{new Date(article.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            <span>{article.author}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-main mt-2">
            {article.title}
          </h2>
          <p className="text-gray-600 mt-2">
            {sanitizedDescription}
          </p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-500 max-sm:text-sm px-6 py-2 rounded-full bg-gray-200">
              Artykuł niedostępny
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden mb-6">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-64 sm:h-96 object-cover"
      />
      <div className="py-5">
        <div className="text-xs sm:text-sm text-gray-500 flex gap-4 items-center">
          <span>{new Date(article.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          <span>{article.author}</span>
          {/* <span className="flex items-center">
            <Eye className="size-3 sm:size-4 lg:size-5 mr-1" /> {article.views} wyświetleń
          </span>
          <span className="flex items-center">
            <Heart className="size-3 sm:size-4 lg:size-5 mr-1 text-red-500" />{" "}
            {article.likes} polubień
          </span> */}
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-main mt-2">
          {article.title}
        </h2>
        <p className="text-gray-600 mt-2">
          {sanitizedDescription}
        </p>
        <div className="flex justify-between items-center mt-4">
          <Link
            to={`/aktualnosci/${validSlug}`}
            className="text-main max-sm:text-sm px-6 py-2 rounded-full bg-main-light transition"
          >
            Czytaj więcej »
          </Link>
        </div>
      </div>
    </div>
  );
};

const NewsList = ({ isNews, selectedCategory }) => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 10;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        let url = `/news?isNews=${isNews}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        const response = await apiCaller("GET", url);
        setNewsData(response.data);
        setCurrentPage(0); // Reset to first page when category changes
      } catch (err) {
        console.error("Nie udało się pobrać aktualności:", err);
        setError("Nie udało się załadować postów");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [isNews, selectedCategory]);

  const pageCount = Math.ceil(newsData.length / articlesPerPage);
  const  currentArticles = newsData.slice(
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
          <p className="text-gray-500">Wczytywanie...</p>
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
            previousLabel={"Poprzednia"}
            nextLabel={"Następna"}
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
          <p className="text-gray-500 text-xl">Brak dostępnych postów</p>
        </div>
      )}
    </div>
  );
};

export default NewsList;
