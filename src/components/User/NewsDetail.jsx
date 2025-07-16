import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { GoDotFill } from "react-icons/go";
import { apiCaller } from "../../utils/axiosInstance";
import DOMPurify from "dompurify";
import MetaTags from '../UtilComponents/MetaTags';

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const isBlog = location.pathname.startsWith('/poradnik/');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const endpoint = isBlog ? `/blogs/slug/${slug}` : `/news/slug/${slug}`;
        const response = await apiCaller("GET", endpoint);
        setNews(response.data);
        
        // Add page data to DOM for SEO
        const pageData = {
          shortDescription: response.data.description,
          title: response.data.title,
          date: response.data.date,
          author: response.data.author,
          type: isBlog ? 'blog' : 'news'
        };
        
        // Remove existing page data if any
        const existingData = document.querySelector('script[data-page-data]');
        if (existingData) {
          existingData.remove();
        }
        
        // Add new page data
        const script = document.createElement('script');
        script.type = 'application/json';
        script.setAttribute('data-page-data', '');
        script.textContent = JSON.stringify(pageData);
        document.head.appendChild(script);
        
        // Clean up on unmount
        return () => {
          const script = document.querySelector('script[data-page-data]');
          if (script) {
            script.remove();
          }
        };
      } catch (error) {
        console.error(`Nie udało się pobrać ${isBlog ? 'artykułu' : 'aktualności'}:`, error);
        navigate(isBlog ? "/poradnik" : "/aktualnosci");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug, navigate, isBlog]);

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html || '') };
  };

  if (loading) return <p className="text-center p-6">Wczytywanie...</p>;
  if (!news) return null;

  const article = {
    title: news.title,
    description: news.description,
  };

  const metaTitle = isBlog 
    ? `${article.title} | Poradnik – Centrum Medyczne 7`
    : `${article.title} | Aktualności – Centrum Medyczne 7`;

  const metaPath = isBlog 
    ? `/poradnik/${slug}`
    : `/aktualnosci/${slug}`;

  return (
    <>
      <MetaTags 
        title={metaTitle}
        description={article.description}
        path={metaPath}
      />
      <div className="max-w-3xl mx-auto bg-white px-4 rounded-lg mt-32">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 bg-teal-800 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
        >
          ← Powrót
        </button>
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-64 sm:h-96 object-cover mb-2"
        />

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[#008C8C]">{news.title}</h1>

        <p className="text-gray-500 text-sm mb-1">
          {new Date(news.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })} <GoDotFill className="inline text-main" /> {news.author}
        </p>

        <div 
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={createMarkup(news.description)}
        />
      </div>
    </>
  );
};

export default NewsDetail;
