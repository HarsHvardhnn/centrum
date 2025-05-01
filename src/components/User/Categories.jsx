import React, { useEffect, useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCaller("GET","/news/category/news-count");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Nie udało się pobrać kategorii:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="p-4 border rounded-lg border-neutral-200 bg-white w-72">
      <h2 className="text-3xl font-serif font-semibold text-main mb-4">
        Kategorie
      </h2>

      {loading ? (
        <p className="text-gray-500">Ładowanie...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500">Nie znaleziono kategorii</p>
      ) : (
        <ul>
          {categories.map((cat, index) => (
            <li
              key={cat.categoryId || index}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
            >
              <span className="text-gray-700">{cat.name}</span>
              <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                {cat.newsCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Categories;
