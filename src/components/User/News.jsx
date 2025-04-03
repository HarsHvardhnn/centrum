import React from "react";
import Slider from "react-slick";
import newsData from "../../utils/UserSideData/newsData";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";

export default function News() {
  const settings = {
    dots: true,
    infinite: true,
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

  const groupedNews = [];
  for (let i = 0; i < newsData.length; i += 2) {
    groupedNews.push(newsData.slice(i, i + 2));
  }

  return (
    <section className="py-12 md:px-6">
      <h3 className="md:text-xl font-bold text-neutral-800 text-center">
        BETTER INFORMATION, BETTER HEALTH
      </h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 sm:mb-12 text-center">
        News
      </h2>

      <div className="max-w-6xl mx-auto">
        <Slider {...settings}>
          {groupedNews.map((group, index) => (
            <div key={index} className="p-4">
              <div className="grid grid-rows-2 gap-4">
                {group.map((news) => (
                  <div
                    key={news.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden flex"
                  >
                    <div className="w-1/3">
                      <img
                        src={news.image}
                        alt="News"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                    <div className="px-4 py-2 xl:p-4 w-2/3">
                      <p className="text-neutral-700 max-md:text-xs max-xl:text-sm">
                        {news.date} | {news.author}
                      </p>
                      <h4 className="mt-2 sm:text-lg xl:text-xl text-neutral-700">
                        {news.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-4 max-md:text-sm">
                        <span className="flex items-center gap-1">
                          <IoEyeOutline className="text-blue-600 sm:text-xl" />{" "}
                          {news.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaRegHeart className="text-red-500 text-sm sm:text-lg" />{" "}
                          {news.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
