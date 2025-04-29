import { useEffect, useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";

const RecentPosts = ({ isNews }) => {
  const [newsData, setNewsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentNews = async () => {
      try {
        const res = await apiCaller("GET", `/news?latest=5&isNews=${isNews}`);
        setNewsData(res.data);
      } catch (err) {
        setError("Failed to load recent posts");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNews();
  }, []);

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

      <h2 className="text-3xl font-semibold font-serif text-main mb-4">
        Recent Posts
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredNews.length > 0 ? (
        <ul>
          {filteredNews.map((news) => (
            <li key={news._id} className="flex items-center mb-4 gap-2">
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
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">No recent posts found</p>
        </div>
      )}
    </div>
  );
};

export default RecentPosts;
