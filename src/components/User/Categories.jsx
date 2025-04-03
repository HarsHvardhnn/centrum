import React from 'react';
import newsData from '../../utils/UserSideData/newsData';

const Categories = () => {
  const categoryCounts = newsData.reduce((acc, news) => {
    acc[news.category] = (acc[news.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 border rounded-lg border-neutral-200 bg-white w-72">
      <h2 className="text-3xl font-serif font-semibold text-main mb-4">Categories</h2>
      <ul>
        {Object.entries(categoryCounts).map(([category, count], index) => (
          <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span className="text-gray-700">{category}</span>
            <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;