import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Eye,
  Calendar,
  User,
  ThumbsUp,
  Image,
  Tag,
  FileText,
} from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";

const NewsManagement = () => {
  // State management
  const [newsArticles, setNewsArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    date: "",
    description: "",
    shortDescription: "",
    image: "",
    isNews: true,
    category: "",
  });
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [
    isCategoryDeleteConfirmationOpen,
    setIsCategoryDeleteConfirmationOpen,
  ] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: "" });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);

  // Format date to YYYY-MM-DD for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch all news articles and categories on component mount
  useEffect(() => {
    fetchNewsArticles();
    fetchCategories();
  }, []);

  const fetchNewsArticles = async () => {
    setLoading(true);
    try {
      const response = await apiCaller("GET", "/news");
      setNewsArticles(response.data);
      setError(null);
    } catch (err) {
      setError("Nie udało się pobrać artykułów. Spróbuj ponownie.");
      console.error("Error fetching news articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiCaller("GET", "/news/category/list");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Don't set main error state here to avoid interrupting news flow
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (categoryErrors[name]) {
      setCategoryErrors({
        ...categoryErrors,
        [name]: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Tytuł jest wymagany";
    if (!formData.date.trim()) errors.date = "Data jest wymagana";
    if (!formData.shortDescription.trim()) errors.shortDescription = "Krótki opis jest wymagany";
    if (!formData.description.trim()) errors.description = "Opis jest wymagany";
    if (!formData.category) errors.category = "Kategoria jest wymagana";
    if (!imageFile && !currentArticle) errors.image = "Zdjęcie jest wymagane";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
    const errors = {};
    if (!categoryFormData.name.trim()) errors.name = "Nazwa kategorii jest wymagana";
    setCategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("author", formData.author);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("shortDescription", formData.shortDescription);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("isNews", formData.isNews);
    formDataToSend.append("category", formData.category);

    // Append image file if selected
    if (imageFile) {
      formDataToSend.append("file", imageFile);
    }

    try {
      if (currentArticle) {
        // Update existing article
        await apiCaller("PUT", `/news/${currentArticle._id}`, formDataToSend);
      } else {
        // Create new article
        await apiCaller("POST", "/news", formDataToSend);
      }

      // Reset form and refresh news list
      resetForm();
      setIsModalOpen(false);
      fetchNewsArticles();
    } catch (err) {
      setError("Nie udało się zapisać artykułu. Spróbuj ponownie.");
      console.error("Error saving news article:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!validateCategoryForm()) return;

    setLoading(true);

    try {
      await apiCaller("POST", "/news/category", categoryFormData);
      
      // Reset form and refresh categories list
      setCategoryFormData({ name: "" });
      setCategoryErrors({});
      await fetchCategories();
      setIsCategoryModalOpen(false);
    } catch (err) {
      setCategoryErrors({
        name: "Nie udało się utworzyć kategorii. Może już istnieć."
      });
      console.error("Error creating category:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      await apiCaller("DELETE", `/news/category/${categoryToDelete._id}`);
      setCategories(categories.filter((c) => c._id !== categoryToDelete._id));
      setIsCategoryDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError("Nie udało się usunąć kategorii. Może być używana przez artykuły.");
      console.error("Error deleting category:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title || "",
      author: article.author || "",
      date: formatDateForInput(article.date) || "",
      shortDescription: article.shortDescription || "",
      description: article.description || "",
      image: article.image || "",
      isNews: article.isNews,
      category: article.category || "",
    });
    setImagePreview(article.image ? article.image : null);
    setImageFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteConfirmation = (article) => {
    setArticleToDelete(article);
    setIsConfirmModalOpen(true);
  };

  const openCategoryDeleteConfirmation = (category) => {
    setCategoryToDelete(category);
    setIsCategoryDeleteModalOpen(true);
  };

  const deleteArticle = async () => {
    if (!articleToDelete) return;

    setLoading(true);
    try {
      await apiCaller("DELETE", `/news/${articleToDelete._id}`);
      setNewsArticles(
        newsArticles.filter((a) => a._id !== articleToDelete._id)
      );
      setIsConfirmModalOpen(false);
      setArticleToDelete(null);
    } catch (err) {
      setError("Nie udało się usunąć artykułu. Spróbuj ponownie.");
      console.error("Error deleting news article:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      date: "",
      shortDescription: "",
      description: "",
      image: "",
      isNews: true,
      category: "",
    });
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setCurrentArticle(null);
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openAddCategoryModal = () => {
    setCategoryFormData({ name: "" });
    setCategoryErrors({});
    setIsCategoryModalOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : "Nieznana";
  };

  const filteredArticles = searchTerm
    ? newsArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.category?.name && article.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : newsArticles;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Zarządzanie Aktualnościami
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj aktualności..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={openAddCategoryModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <Tag size={18} />
            <span>Dodaj Kategorię</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <PlusCircle size={18} />
            <span>Dodaj Aktualność</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
          <AlertCircle
            className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
            size={20}
          />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Categories Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Kategorie</h2>
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div 
                key={category._id} 
                className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span className="text-sm font-medium text-gray-800">{category.name}</span>
                <button
                  onClick={() => openCategoryDeleteConfirmation(category)}
                  className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-gray-200"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Brak kategorii. Dodaj pierwszą, aby rozpocząć.</p>
          )}
        </div>
      </div>

      {/* News Articles Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tytuł
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wyświetlenia/Polubienia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Typ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && !newsArticles.length ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Ładowanie aktualności...
                </td>
              </tr>
            ) : filteredArticles.length ? (
              filteredArticles.map((article) => (
                <tr key={article._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="h-10 w-10 rounded-md object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {article.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {article.author}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDateForDisplay(article.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {article.category?.name || getCategoryName(article.category) || "Bez kategorii"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex text-sm text-gray-500 items-center">
                      <Eye size={14} className="mr-1" /> {article.views || 0}
                      <span className="mx-2">•</span>
                      <ThumbsUp size={14} className="mr-1" /> {article.likes || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.isNews
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {article.isNews ? "Aktualność" : "Artykuł"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openEditModal(article)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(article)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Nie znaleziono aktualności.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Czy na pewno chcesz usunąć "{articleToDelete?.title}"? Tej operacji nie można cofnąć.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={deleteArticle}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {isCategoryDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie kategorii
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Czy na pewno chcesz usunąć kategorię "{categoryToDelete?.name}"? Tej operacji nie można cofnąć.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCategoryDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={deleteCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {currentArticle ? "Edytuj Aktualność" : "Dodaj Nową Aktualność"}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tytuł
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors.title
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Autor
                  </label>
                  <input
                    type="text"
                    name="author"
                    id="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors.author
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    }`}
                  />
                  {formErrors.author && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.author}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Data
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors.date
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    }`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Kategoria
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors.category
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    }`}
                  >
                    <option value="">Wybierz kategorię</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="shortDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Krótki opis
                </label>
                <textarea
                  name="shortDescription"
                  id="shortDescription"
                  rows={2}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Wprowadź krótki opis, który będzie widoczny na liście aktualności"
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.shortDescription
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  }`}
                />
                {formErrors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.shortDescription}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pełny opis
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.description
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zdjęcie
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:text-red-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 w-32 border-2 border-gray-300 border-dashed rounded-lg">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer hover:text-teal-500"
                      >
                        <Image size={24} />
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  )}
                  {formErrors.image && (
                    <p className="text-sm text-red-600">{formErrors.image}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNews"
                  name="isNews"
                  checked={formData.isNews}
                  onChange={(e) =>
                    setFormData({ ...formData, isNews: e.target.checked })
                  }
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isNews"
                  className="ml-2 block text-sm text-gray-900"
                >
                  To jest aktualność (nie artykuł)
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                >
                  {currentArticle ? "Zapisz zmiany" : "Dodaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Dodaj Nową Kategorię
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nazwa Kategorii
                </label>
                <input
                  type="text"
                  name="name"
                  id="categoryName"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    categoryErrors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  }`}
                />
                {categoryErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {categoryErrors.name}
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                >
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;