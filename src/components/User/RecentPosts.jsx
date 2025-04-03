import { useState } from "react";
import newsData from "../../utils/UserSideData/newsData";
const RecentPosts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = newsData.filter((news) =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 border rounded-lg border-neutral-200 bg-white w-72">
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 border rounded-lg pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute left-2 top-2 text-gray-500">🔍</span>
      </div>
      <h2 className="text-3xl font-semibold font-serif text-main mb-4">Recent Posts</h2>
      <ul>
        {filteredNews.map((news) => (
          <li key={news.id} className="flex items-center mb-4 gap-2">
            <div className="size-12 w-1/5">
              <img
                src={news.image}
                alt={news.title}
                className="rounded h-full w-16 object-cover"
              />
            </div>
            <div className="w-4/5">
              <p className="text-sm text-blue-500">{news.date}</p>
              <p className="text-sm text-gray-700 font-semibold">
                {news.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default RecentPosts;
