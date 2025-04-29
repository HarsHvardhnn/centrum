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
    return date.toLocaleDateString("en-US", {
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
      setError("Failed to fetch news articles. Please try again.");
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
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.author.trim()) errors.author = "Author is required";
    if (!formData.date.trim()) errors.date = "Date is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.category) errors.category = "Category is required";
    if (!imageFile && !currentArticle) errors.image = "Image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
    const errors = {};
    if (!categoryFormData.name.trim()) errors.name = "Category name is required";
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
      setError("Failed to save news article. Please try again.");
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
        name: "Failed to create category. It might already exist."
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
      setError("Failed to delete category. It might be in use by news articles.");
      console.error("Error deleting category:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title,
      author: article.author,
      date: formatDateForInput(article.date),
      description: article.description || "",
      isNews: article.isNews !== undefined ? article.isNews : true,
      category: article.category?._id || article.category || "",
    });

    // If there's an existing image, set it as preview
    if (article.image) {
      setImagePreview(article.image);
    } else {
      setImagePreview(null);
    }

    setImageFile(null); // Reset file input
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
      setError("Failed to delete news article. Please try again.");
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
      description: "",
      isNews: true,
      category: "",
    });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
    setCurrentArticle(null);
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
    return category ? category.name : "Unknown";
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
          News Management
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search news..."
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
            <span>Add Category</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <PlusCircle size={18} />
            <span>Add News</span>
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
        <h2 className="text-lg font-medium text-gray-800 mb-3">Categories</h2>
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
            <p className="text-gray-500 text-sm">No categories found. Add one to get started.</p>
          )}
        </div>
      </div>

      {/* News Articles Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views/Likes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && !newsArticles.length ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Loading news articles...
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
                        {article.category?.name || getCategoryName(article.category) || "Uncategorized"}
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
                      {article.isNews ? "News" : "Blog"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(article)}
                        className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(article)}
                        className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
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
                  No news articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentArticle ? "Edit News Article" : "Add New News Article"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      formErrors.title ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Author */}
                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Author*
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      formErrors.author ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.author && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.author}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date*
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      formErrors.date ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.date}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      formErrors.description ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      formErrors.category ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="">Select a category</option>
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

                {/* Type (News or Article) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        id="news-type"
                        name="isNews"
                        type="radio"
                        checked={formData.isNews === true}
                        onChange={() =>
                          setFormData({ ...formData, isNews: true })
                        }
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <label
                        htmlFor="news-type"
                        className="ml-2 text-sm text-gray-700"
                      >
                        News
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="article-type"
                        name="isNews"
                        type="radio"
                        checked={formData.isNews === false}
                        onChange={() =>
                          setFormData({ ...formData, isNews: false })
                        }
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <label
                        htmlFor="article-type"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Blog
                      </label>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image {currentArticle ? "" : "*"}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>

                  {formErrors.image && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.image}
                    </p>
                  )}

                  {/* Image preview */}
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>{currentArticle ? "Update" : "Create"} Article</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Add New Category
              </h2>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-4">
              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    className={`w-full p-2 border ${
                      categoryErrors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {categoryErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {categoryErrors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>Create Category</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600">
                Are you sure you want to delete the article "{currentArticle?.title}"? This action cannot be undone.
              </p>
            </div>

            <div className="p-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmationOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteArticle}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {isCategoryDeleteConfirmationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Category Deletion
              </h2>
              <p className="text-gray-600">
                Are you sure you want to delete the category "{currentCategory?.name}"? 
                Articles associated with this category will be set to uncategorized.
              </p>
            </div>

            <div className="p-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCategoryDeleteConfirmationOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>)}


export default  NewsManagement;