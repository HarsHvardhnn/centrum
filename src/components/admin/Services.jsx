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
      setError("Nie udało się pobrać usług. Spróbuj ponownie.");
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
    if (!formData.title.trim()) errors.title = "Tytuł jest wymagany";
    if (!formData.price.trim()) errors.price = "Cena jest wymagana";
  

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
      setError("Nie udało się zapisać usługi. Spróbuj ponownie.");
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
      setError("Nie udało się usunąć usługi. Spróbuj ponownie.");
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
          Zarządzanie Usługami
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj usług..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            Dodaj Usługę
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-teal-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Ładowanie usług...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">
            {searchTerm
              ? "Nie znaleziono usług pasujących do wyszukiwania"
              : "Nie dodano jeszcze żadnych usług"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Image className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {service.title}
                  </h2>
                  <p className="text-teal-600 font-semibold">{service.price} zł</p>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {service.shortDescription}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => openEditModal(service)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edytuj
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDeleteConfirmation(service)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentService ? "Edytuj Usługę" : "Dodaj Nową Usługę"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
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

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tytuł
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
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
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cena
                    </label>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        formErrors.price
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                      }`}
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shortDescription"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Krótki Opis
                    </label>
                    <input
                      type="text"
                      id="shortDescription"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pełny Opis
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Punkty
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={tempBulletPoint}
                        onChange={(e) => setTempBulletPoint(e.target.value)}
                        onKeyPress={handleBulletPointKeyPress}
                        placeholder="Naciśnij Enter, aby dodać punkt"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    {formData.bulletPoints.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {formData.bulletPoints.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <span className="text-sm text-gray-700">{point}</span>
                            <button
                              type="button"
                              onClick={() => removeBulletPoint(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Zdjęcia
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="images"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                          >
                            <span>Prześlij pliki</span>
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
                          <p className="pl-1">lub przeciągnij i upuść</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF do 10MB
                        </p>
                      </div>
                    </div>
                    {imagePreview.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden"
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                      loading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Zapisywanie..." : "Zapisz"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Czy na pewno chcesz usunąć tę usługę? Tej operacji nie można cofnąć.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={deleteService}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Usuwanie..." : "Usuń"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
