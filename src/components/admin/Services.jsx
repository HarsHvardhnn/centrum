import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Eye,
  Image,
  FileText,
} from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";

const ServicesManagement = () => {
  // State management
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    shortDescription: "",
    description: "",
    bulletPoints: [],
    images: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [tempBulletPoint, setTempBulletPoint] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Fetch all services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await apiCaller("GET", "/services");
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch services. Please try again.");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
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

  const handleBulletPointKeyPress = (e) => {
    if (e.key === "Enter" && tempBulletPoint.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        bulletPoints: [...formData.bulletPoints, tempBulletPoint.trim()],
      });
      setTempBulletPoint("");
    }
  };

  const removeBulletPoint = (index) => {
    const updatedPoints = [...formData.bulletPoints];
    updatedPoints.splice(index, 1);
    setFormData({
      ...formData,
      bulletPoints: updatedPoints,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedFiles = [...imageFiles];
    const updatedPreviews = [...imagePreview];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setImageFiles(updatedFiles);
    setImagePreview(updatedPreviews);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.price.trim()) errors.price = "Price is required";
  

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Create FormData object for file uploads
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("shortDescription", formData.shortDescription);
    formDataToSend.append("description", formData.description);
    formDataToSend.append(
      "bulletPoints",
      JSON.stringify(formData.bulletPoints)
    );

    // Append all image files
    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    try {
      if (currentService) {
        // Update existing service
        await apiCaller(
          "PUT",
          `/services/${currentService._id}`,
          formDataToSend
        );
      } else {
        // Create new service
        await apiCaller("POST", "/services", formDataToSend);
      }

      // Reset form and refresh services list
      resetForm();
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      setError("Failed to save service. Please try again.");
      console.error("Error saving service:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (service) => {
    setCurrentService(service);
    setFormData({
      title: service.title,
      price: service.price,
      shortDescription: service.shortDescription,
      description: service.description,
      bulletPoints: service.bulletPoints || [],
      images: service.images || [],
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirmation = (service) => {
    setServiceToDelete(service);
    setIsConfirmModalOpen(true);
  };

  const deleteService = async () => {
    if (!serviceToDelete) return;

    setLoading(true);
    try {
      await apiCaller("DELETE", `/services/${serviceToDelete._id}`);
      setServices(services.filter((s) => s._id !== serviceToDelete._id));
      setIsConfirmModalOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      setError("Failed to delete service. Please try again.");
      console.error("Error deleting service:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      shortDescription: "",
      description: "",
      bulletPoints: [],
      images: [],
    });
    setImageFiles([]);
    setImagePreview([]);
    setTempBulletPoint("");
    setFormErrors({});
    setCurrentService(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredServices = searchTerm
    ? services.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.shortDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : services;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Services Management
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
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
            onClick={openAddModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <PlusCircle size={18} />
            <span>Add Service</span>
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

      {/* Services Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && !services.length ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Loading services...
                </td>
              </tr>
            ) : filteredServices.length ? (
              filteredServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {service.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{service.price || 0}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {service.shortDescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {service.images?.length || 0} images
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(service)}
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
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentService ? "Edit Service" : "Add New Service"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Icon */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price*
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="price..."
                    className={`w-full p-2 border ${
                      formErrors.price ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="shortDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Short Description
                  </label>
                  <input
                    type="text"
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${
                      formErrors.shortDescription
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.shortDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.shortDescription}
                    </p>
                  )}
                </div>

                {/* Full Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full p-2 border ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Bullet Points */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bullet Points
                  </label>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={tempBulletPoint}
                      onChange={(e) => setTempBulletPoint(e.target.value)}
                      onKeyPress={handleBulletPointKeyPress}
                      placeholder="Add a bullet point and press Enter"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {formErrors.bulletPoints && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.bulletPoints}
                    </p>
                  )}

                  <ul className="mt-2 space-y-2">
                    {formData.bulletPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-center bg-gray-50 p-2 rounded"
                      >
                        <span className="flex-1 text-sm">{point}</span>
                        <button
                          type="button"
                          onClick={() => removeBulletPoint(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images {currentService ? "" : "*"}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>

                  {formErrors.images && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.images}
                    </p>
                  )}

                  {/* Image previews */}
                  {imagePreview.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {imagePreview.map((src, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={src}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing images if editing */}
                  {currentService &&
                    currentService.images &&
                    currentService.images.length > 0 && (
                      <>
                        <h4 className="mt-4 text-sm font-medium text-gray-700">
                          Existing Images
                        </h4>
                        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-4">
                          {currentService.images.map((src, index) => (
                            <div key={`existing-${index}`} className="relative">
                              <img
                                src={src}
                                alt={`Service image ${index + 1}`}
                                className="h-24 w-full object-cover rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Note: Uploading new images will replace the existing
                          ones.
                        </p>
                      </>
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
                    <>{currentService ? "Update" : "Create"} Service</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="mr-2" size={24} />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the service "
              {serviceToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteService}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
