import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { apiCaller } from "../../utils/axiosInstance";

export default function News() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCaller("GET", "/news/category/list");
        setCategories(response.data);
      } catch (error) {
        console.error("Nie udało się pobrać kategorii:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = selectedCategory 
          ? `/news?category=${selectedCategory}` 
          : "/news";
        const response = await apiCaller("GET", url);
        setNews(response.data);
      } catch (error) {
        console.error("Nie udało się pobrać aktualności:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  // Only enable infinite scrolling if we have more than 4 news items
  const settings = {
    dots: true,
    infinite: news.length > 4,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  // Group news items into pairs for the slider
  const groupedNews = [];
  for (let i = 0; i < news.length; i += 2) {
    groupedNews.push(news.slice(i, i + 2));
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  if (loading) {
    return (
      <section className="py-12 md:px-6">
        <div className="max-w-6xl mx-auto text-center">Wczytywanie aktualności...</div>
      </section>
    );
  }

  return (
    <section className="py-12 md:px-6">
      <h3 className="md:text-xl font-bold text-neutral-800 text-center">
        WIEDZA, KTÓRA MA ZNACZENIE
      </h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 text-center">
        Aktualności
      </h2>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-full transition-colors ${
              !selectedCategory
                ? "bg-main text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category._id
                  ? "bg-main text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {news.length === 0 ? (
        <div className="max-w-6xl mx-auto text-center">
          {selectedCategory 
            ? "Brak aktualności w wybranej kategorii."
            : "Brak dostępnych aktualności."}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto overflow-clip">
          <Slider {...settings}>
            {groupedNews.map((group, index) => (
              <div key={index} className="p-4">
                <div className="grid grid-rows-2 gap-4">
                  {group.map((newsItem) => (
                    <div
                      key={newsItem._id}
                      className="bg-white shadow-md rounded-lg overflow-hidden flex"
                    >
                      <div className="w-1/3">
                        <img
                          src={newsItem.image}
                          alt={newsItem.title}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      <div className="px-4 py-2 xl:p-4 w-2/3">
                        {/* <p className="text-neutral-700 max-md:text-xs max-xl:text-sm">
                          {newsItem.date} | {newsItem.author}
                        </p> */}
                        <h4 className="mt-2 sm:text-lg xl:text-xl text-neutral-700">
                          {newsItem.title}
                        </h4>
                        {/* <div className="flex items-center gap-4 mt-4 max-md:text-sm">
                          <span className="flex items-center gap-1">
                            <IoEyeOutline className="text-blue-600 sm:text-xl" />{" "}
                            {newsItem.views} wyświetleń
                          </span>
                          <span className="flex items-center gap-1">
                            <FaRegHeart className="text-red-500 text-sm sm:text-lg" />{" "}
                            {newsItem.likes} polubień
                          </span>
                        </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
}
