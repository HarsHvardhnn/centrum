import React, { useState } from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import NewsList from "../NewsList";
import Categories from "../Categories";
import RecentPosts from "../RecentPosts";
import MetaTags from '../../UtilComponents/MetaTags';

const NewsPage = ({isNews=true}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const title = isNews 
    ? "Aktualności – Centrum Medyczne 7 Skarżysko-Kamienna | Nowości i ogłoszenia"
    : "CM7 – Artykuły i porady zdrowotne | Poradnik medyczny";
  
  const description = isNews
    ? "Bądź na bieżąco z informacjami w CM7. Ogłoszenia, zmiany godzin pracy, wydarzenia i komunikaty."
    : "Sprawdzone porady zdrowotne i artykuły medyczne od specjalistów CM7 w Skarżysku-Kamiennej. Praktyczna wiedza i wskazówki dla pacjentów.";

  const path = isNews ? "/aktualnosci" : "/poradnik";

  return (
    <>
      <MetaTags 
        title={title}
        description={description}
        path={path}
      />
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
