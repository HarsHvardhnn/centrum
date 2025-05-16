import React, { useState } from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import NewsList from "../NewsList";
import Categories from "../Categories";
import RecentPosts from "../RecentPosts";

const NewsPage = ({isNews=true}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <>
      <PageHeader
        title={isNews ? "Aktualności" : "Blog"}
        path={isNews ? "STRONA GŁÓWNA / AKTUALNOŚCI" : "STRONA GŁÓWNA / BLOG"}
        bgurl={isNews ? "/images/news.jpg" : "/images/blogs.jpg"}
      />
      <div className="flex max-w-6xl mx-auto mt-16">
        <div className="flex-1">
          <NewsList 
            isNews={isNews} 
            selectedCategory={selectedCategory}
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 mt-4 w-80">
          <RecentPosts isNews={isNews} />
          <Categories 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>
      <ContactSection />
    </>
  );
};

export default NewsPage;
