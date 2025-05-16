import React, { useState, useEffect } from 'react';
import { apiCaller } from '../../utils/axiosInstance';

const Categories = ({ selectedCategory, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCaller("GET", "/news/category/news-count");
        setCategories(response.data);
      } catch (error) {
        console.error("Nie udało się pobrać kategorii:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="bg-white p-6 rounded-lg">Ładowanie kategorii...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Kategorie</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onCategorySelect(null)}
          className={`text-left px-4 py-2 rounded-lg transition-colors ${
            !selectedCategory
              ? "bg-main text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Wszystkie
          <span className="float-right">{categories.length}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategorySelect(category._id)}
            className={`text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category._id
                ? "bg-main text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {category.name}
            <span className="float-right">{category.newsCount || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
