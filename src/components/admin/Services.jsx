import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Image,
  FileText,
  ArrowLeft,
  Users,
  Globe,
  Wrench,
} from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";
import { useServices } from "../../context/serviceContext";
import { readListState, writeListState } from "../../hooks/usePersistedListState";
import doctorService from "../../helpers/doctorHelper";
import userServiceHelper, {
  mapDoctorServicesResponseToCatalog,
} from "../../helpers/userServiceHelper";

const ServicesManagement = () => {
 const{fetchServices:fetchServicesFromContext}= useServices()
  // State management
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    (readListState("admin-services") || {}).searchTerm || ""
  );
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    shortDescription: "",
    description: "",
    bulletPoints: [],
    images: [],
    redirectionUrl: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [tempBulletPoint, setTempBulletPoint] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [systemForm, setSystemForm] = useState({ title: "", price: "", tax: "" });
  const [systemFormErrors, setSystemFormErrors] = useState({});
  const [section, setSection] = useState(null);
  const [systemServices, setSystemServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assignService, setAssignService] = useState(null);
  const [assignedDoctorIds, setAssignedDoctorIds] = useState([]);
  const [assignDraftIds, setAssignDraftIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);

  const doctorLabel = (doc) => {
    const n = doc?.name;
    if (typeof n === "string" && n.trim()) return n.trim();
    const full = `${n?.first || ""} ${n?.last || ""}`.trim();
    return full || doc?.email || "Lekarz";
  };

  const doctorIdOf = (doc) => doc?._id || doc?.id;

  useEffect(() => {
    if (section === "website") fetchServices();
    if (section === "system") {
      fetchSystemServices();
      loadDoctors();
    }
  }, [section]);

  useEffect(() => {
    writeListState("admin-services", { searchTerm });
  }, [searchTerm]);

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

  const fetchSystemServices = async () => {
    setLoading(true);
    try {
      const response = await apiCaller("GET", "/system-services");
      setSystemServices(
        (Array.isArray(response.data) ? response.data : []).map((s) => ({
          ...s,
          source: "system",
        }))
      );
      setError(null);
    } catch (err) {
      setError("Nie udało się pobrać usług systemowych. Spróbuj ponownie.");
      console.error("Error fetching system services:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorService.getAllDoctors({ limit: 200 });
      setDoctors(response?.doctors || []);
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for price to ensure it's numeric
    if (name === 'price') {
      // If input is empty or a valid number, update state
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      // For other fields, update normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
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

    // Check if this is a new file (has object URL) or existing image
    const isNewFile = updatedPreviews[index] && updatedPreviews[index].startsWith('blob:');
    
    if (isNewFile) {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(updatedPreviews[index]);
    }

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setImageFiles(updatedFiles);
    setImagePreview(updatedPreviews);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Tytuł jest wymagany";
    
    if (!formData.price) {
      errors.price = "Cena jest wymagana";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = "Cena musi być liczbą dodatnią";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isSystemService = (service) =>
    service?.source === "system" || service?.serviceModel === "SystemService";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

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
    formDataToSend.append("redirectionUrl", formData.redirectionUrl || "");

    // Append all new image files
    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    // If editing, also send the remaining existing images
    if (currentService) {
      // Filter out images that were removed (not in current preview)
      const existingImages = currentService.images || [];
      const remainingImages = existingImages.filter(img => 
        imagePreview.includes(img)
      );
      
      if (remainingImages.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(remainingImages));
      }
    }

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
      fetchServicesFromContext()
    } catch (err) {
      setError("Nie udało się zapisać usługi. Spróbuj ponownie.");
      console.error("Error saving service:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (service) => {
    if (section === "system" || isSystemService(service)) {
      setCurrentService(service);
      setSystemForm({
        title: service.title || "",
        price: service.price ?? "",
        tax: service.tax || "",
      });
      setSystemFormErrors({});
      setIsSystemModalOpen(true);
      return;
    }
    setCurrentService(service);
    setFormData({
      title: service.title,
      price: service.price,
      shortDescription: service.shortDescription,
      description: service.description,
      bulletPoints: service.bulletPoints || [],
      images: service.images || [],
      redirectionUrl: service.redirectionUrl || "",
    });
    
    // Set existing images as previews
    if (service.images && service.images.length > 0) {
      setImagePreview(service.images);
    } else {
      setImagePreview([]);
    }
    
    // Clear any new image files
    setImageFiles([]);
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
      if (section === "system" || isSystemService(serviceToDelete)) {
        await apiCaller("DELETE", `/system-services/${serviceToDelete._id}`);
      } else {
        await apiCaller("DELETE", `/services/${serviceToDelete._id}`);
      }
      setServices(services.filter((s) => s._id !== serviceToDelete._id));
      setSystemServices(systemServices.filter((s) => s._id !== serviceToDelete._id));
      setIsConfirmModalOpen(false);
      setServiceToDelete(null);
      fetchServicesFromContext();
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
      redirectionUrl: "",
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

  const openAddSystemModal = () => {
    setCurrentService(null);
    setSystemForm({ title: "", price: "", tax: "" });
    setSystemFormErrors({});
    setIsSystemModalOpen(true);
  };

  const handleSystemSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!systemForm.title.trim()) errors.title = "Tytuł jest wymagany";
    if (systemForm.price === "" || isNaN(Number(systemForm.price)) || Number(systemForm.price) < 0) {
      errors.price = "Cena musi być liczbą dodatnią";
    }
    setSystemFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: systemForm.title.trim(),
        price: Number(systemForm.price),
      };
      if (systemForm.tax === "zw" || systemForm.tax === "8" || systemForm.tax === "23") {
        payload.tax = systemForm.tax;
      }
      if (currentService && (isSystemService(currentService) || section === "system")) {
        await apiCaller("PUT", `/system-services/${currentService._id}`, payload);
      } else {
        await apiCaller("POST", "/system-services", payload);
      }
      setIsSystemModalOpen(false);
      setCurrentService(null);
      fetchSystemServices();
      fetchServicesFromContext();
    } catch (err) {
      setError("Nie udało się zapisać usługi systemowej. Spróbuj ponownie.");
      console.error("Error saving system service:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = async (service) => {
    setAssignService(service);
    setAssignLoading(true);
    setAssignedDoctorIds([]);
    setAssignDraftIds([]);
    try {
      const list = doctors.length ? doctors : (await doctorService.getAllDoctors({ limit: 200 }))?.doctors || [];
      if (!doctors.length) setDoctors(list);
      const checks = await Promise.all(
        list.map(async (doc) => {
          const id = doctorIdOf(doc);
          try {
            const rows = await userServiceHelper.getDoctorServices(id);
            const catalog = mapDoctorServicesResponseToCatalog(rows).map((s) =>
              String(s._id)
            );
            return catalog.includes(String(service._id)) ? id : null;
          } catch {
            return null;
          }
        })
      );
      const assigned = checks.filter(Boolean);
      setAssignedDoctorIds(assigned);
      setAssignDraftIds(assigned);
    } catch (err) {
      console.error("Error loading doctor assignments:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleAssignDoctor = (id) => {
    setAssignDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveDoctorAssignments = async () => {
    if (!assignService) return;
    setAssignSaving(true);
    try {
      const serviceId = assignService._id;
      const toAdd = assignDraftIds.filter((id) => !assignedDoctorIds.includes(id));
      const toRemove = assignedDoctorIds.filter((id) => !assignDraftIds.includes(id));
      await Promise.all([
        ...toAdd.map((id) =>
          userServiceHelper.addDoctorServices(id, [
            {
              serviceId,
              price: parseFloat(assignService.price) || 0,
              serviceModel: "SystemService",
            },
          ])
        ),
        ...toRemove.map((id) => userServiceHelper.removeDoctorService(id, serviceId)),
      ]);
      setAssignService(null);
    } catch (err) {
      setError("Nie udało się zapisać przypisania do lekarzy.");
      console.error(err);
    } finally {
      setAssignSaving(false);
    }
  };

  const websiteServices = searchTerm
    ? services.filter(
        (service) =>
          (service.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.shortDescription || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : services;

  const systemFiltered = searchTerm
    ? systemServices.filter((service) =>
        (service.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : systemServices;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {!section && (
        <>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Zarządzanie Usługami
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Wybierz katalog. Usługi na stronie i usługi systemowe są osobne — nie miesza się ich w jednym widoku.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <button
              type="button"
            onClick={() => {
              setSearchTerm("");
              setSection("website");
            }}
              className="text-left border rounded-xl p-6 hover:shadow-md hover:border-teal-400 transition-all"
            >
              <Globe className="h-10 w-10 text-teal-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Usługi na stronie
              </h2>
              <p className="text-sm text-gray-500">
                Oferta publiczna: zdjęcia, opisy, kafelki na stronie internetowej.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSection("system");
              }}
              className="text-left border rounded-xl p-6 hover:shadow-md hover:border-slate-400 transition-all"
            >
              <Wrench className="h-10 w-10 text-slate-700 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Usługi systemowe
              </h2>
              <p className="text-sm text-gray-500">
                Katalog techniczny do rozliczeń i przypisania lekarzowi. Bez strony i zdjęć.
              </p>
            </button>
          </div>
        </>
      )}

      {section === "website" && (
        <>
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSection(null)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Usługi na stronie
          </h1>
        </div>
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
            Dodaj usługę
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-teal-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Ładowanie usług...</p>
        </div>
      ) : websiteServices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">
            {searchTerm
              ? "Nie znaleziono usług pasujących do wyszukiwania"
              : "Nie dodano jeszcze żadnych usług na stronie"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websiteServices.map((service) => (
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
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {service.title}
                  </h2>
                  <p className="text-teal-600 font-semibold whitespace-nowrap">{service.price} zł</p>
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
          ))}
        </div>
      )}
        </>
      )}

      {section === "system" && (
        <>
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSection(null)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć
              </button>
              <h1 className="text-2xl font-semibold text-gray-800">
                Usługi systemowe
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={openAddSystemModal}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
              >
                <PlusCircle className="h-5 w-5" />
                Dodaj usługę
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Lista techniczna: nazwa, cena, VAT. Przypisz usługę do lekarza — nie publikuje się na stronie.
          </p>
          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-teal-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Ładowanie usług...</p>
            </div>
          ) : systemFiltered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">
                {searchTerm
                  ? "Nie znaleziono usług"
                  : "Brak usług systemowych. Dodaj pierwszą przyciskiem powyżej."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nazwa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cena</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAT</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemFiltered.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{service.price} zł</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{service.tax || "—"}</td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openAssignModal(service)}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 mr-3"
                        >
                          <Users className="h-4 w-4" />
                          Przypisz lekarza
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edytuj
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirmation(service)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
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
                    <label
                      htmlFor="redirectionUrl"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Redirection URL
                    </label>
                    <input
                      type="text"
                      id="redirectionUrl"
                      name="redirectionUrl"
                      value={formData.redirectionUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com or /route"
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
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center gap-2 ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Zapisywanie...
                      </>
                    ) : (
                      "Zapisz"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* System catalog modal (no website page) */}
      {isSystemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <form onSubmit={handleSystemSubmit} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentService && isSystemService(currentService)
                    ? "Edytuj usługę systemową"
                    : "Dodaj do systemu"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsSystemModalOpen(false);
                    setCurrentService(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Usługa tylko do rozliczeń i przypisania lekarzowi. Nie pojawia się na stronie.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nazwa</label>
                  <input
                    type="text"
                    value={systemForm.title}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                  {systemFormErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{systemFormErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cena bazowa (zł)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={systemForm.price}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, price: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                  {systemFormErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{systemFormErrors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT (opcjonalnie)</label>
                  <select
                    value={systemForm.tax}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, tax: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  >
                    <option value="">—</option>
                    <option value="zw">zw</option>
                    <option value="8">8%</option>
                    <option value="23">23%</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSystemModalOpen(false);
                    setCurrentService(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md disabled:opacity-75"
                >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Przypisz lekarza
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {assignService.title} — zaznacz lekarzy, którzy mają tę usługę w katalogu.
            </p>
            {assignLoading ? (
              <p className="text-sm text-gray-500 py-6 text-center">Ładowanie lekarzy...</p>
            ) : doctors.length === 0 ? (
              <p className="text-sm text-gray-500">Brak lekarzy.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto border rounded-md p-2">
                {doctors.map((doc) => {
                  const id = doctorIdOf(doc);
                  return (
                    <li key={id}>
                      <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={assignDraftIds.includes(id)}
                          onChange={() => toggleAssignDoctor(id)}
                        />
                        <span>{doctorLabel(doc)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssignService(null)}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={saveDoctorAssignments}
                disabled={assignLoading || assignSaving}
                className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md disabled:opacity-75"
              >
                {assignSaving ? "Zapisywanie..." : "Zapisz przypisanie"}
              </button>
            </div>
          </div>
        </div>
      )}

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
