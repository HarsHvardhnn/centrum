import React from "react";
import ContactSection from "../ContactSection";
import { useParams } from "react-router-dom";
import NewsDetail from "../NewsDetail";
import RecentPosts from "../RecentPosts";
import Categories from "../Categories";
import NewsHeader from "../NewsHeader";
import newsData from "../../../utils/UserSideData/newsData";

const NewsDetailPage = () => {
  const { newsId } = useParams();
  const news = newsData.find((n) => n.id === Number(newsId));
  return (
    <>
      <NewsHeader news={news} />

      <div className="flex max-w-6xl gap-4 mx-auto mt-16">
        <div>
          <NewsDetail newsId={newsId} />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <RecentPosts />
          <Categories />
        </div>
      </div>

      <ContactSection />
    </>
  );
};

export default NewsDetailPage;
