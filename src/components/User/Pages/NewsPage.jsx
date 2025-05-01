import React from "react";
import ContactSection from "../ContactSection";
import PageHeader from "../PageHeader";
import NewsList from "../NewsList";
import Categories from "../Categories";
import RecentPosts from "../RecentPosts";

const NewsPage = ({isNews=true}) => {
  return (
    <>
      <PageHeader
        title={isNews ? "Aktualności" : "Blog"}
        path={isNews ? "STRONA GŁÓWNA / AKTUALNOŚCI" : "STRONA GŁÓWNA / BLOG"}
        bgurl="/images/about-header.jpg"
      />
      <div className="flex max-w-6xl mx-auto mt-16">
        <div>
          <NewsList isNews={isNews} />
        </div>
        <div className="hidden md:flex flex-col gap-4 mt-4">
          <RecentPosts isNews={isNews} />
          <Categories />
        </div>
      </div>
      <ContactSection />
    </>
  );
};

export default NewsPage;
