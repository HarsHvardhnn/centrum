import React, { useState, useEffect } from "react";
import Calendar from "./SingleDoctor/Calendar";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaPlus, FaArrowLeftLong } from "react-icons/fa6";
import { Globe, Wrench, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import doctorService from "../../helpers/doctorHelper";
import { useLoader } from "../../context/LoaderContext";
import ServiceSelectionModal from "./SingleDoctor/patient-details/ServiceSelectionModal";
import { toast } from "sonner";
import userServiceHelper, {
  formatCatalogTax,
} from "../../helpers/userServiceHelper";

// Doctor services helper

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DoctorDetailPage() {
  const router = useParams();

  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCatalogChooserOpen, setIsCatalogChooserOpen] = useState(false);
  const [serviceCatalogKind, setServiceCatalogKind] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const fetchDoctorData = async () => {
    try {
      // Get doctor ID from query params
      const doctorId = router.id;

      if (!doctorId) return; // Wait until we have the ID

      showLoader();
      const response = await doctorService.getDoctorById(doctorId);

      if (response.success && response.doctor) {
        // Transform the API data to match our component structure
        const transformedData = transformDoctorData(response.doctor);
        setDoctorData(transformedData);

        // Fetch doctor services if available
        try {
          const servicesResponse = await userServiceHelper.getDoctorServices(
            transformedData.id
          );
          //("servicesResponse", servicesResponse);
          if (
            servicesResponse.data &&
            servicesResponse.data.data.services &&
            servicesResponse.data.data.services.length > 0
          ) {
            // //(
            //   "servicesResponse.data.data.services",
            //   servicesResponse.data.data.services
            // );
            setSelectedServices(
              servicesResponse.data.data.services.map((s) => {
                const svc = s.service || {};
                const isSystem =
                  s.serviceModel === "SystemService" ||
                  svc.source === "system";
                return {
                  serviceId: svc._id,
                  title: svc.title,
                  price: s.price,
                  notes: s.notes || "",
                  tax: svc.tax,
                  source: isSystem ? "system" : "website",
                  serviceModel: isSystem ? "SystemService" : "Service",
                };
              })
            );
          }
        } catch (servicesError) {
          console.error("Error fetching doctor services:", servicesError);
        }
      } else {
        setError("Nie udało się załadować danych lekarza");
      }
    } catch (err) {
      console.error("Błąd podczas pobierania danych lekarza:", err);
      setError("Błąd ładowania danych lekarza");
    } finally {
      hideLoader();
    }
  };
  useEffect(() => {
    fetchDoctorData();
  }, [router.id]); // Fixed dependency from router.query to router.id

  // Transform API response to match component data structure
  const transformDoctorData = (apiDoctor) => {
    // //(
    //   "apiDoctor.specialization",
    //   apiDoctor.specialization.map((spec) => spec.name)
    // );
    // //("")
    const fullName = `${apiDoctor.name.first} ${apiDoctor.name.last}`;

    // Create qualification string from the array
    const qualification = apiDoctor.qualifications
      ? apiDoctor.qualifications.join(", ")
      : "";

    // Create specialization string from the array
    const specialization = apiDoctor.specialization
      ? apiDoctor.specialization.map((spec) => spec.name).join(", ")
      : "";

    // Format experience
    const experienceText = apiDoctor.experience
      ? `${apiDoctor.experience} Lat Ogólnego Doświadczenia`
      : "";

    return {
      id: apiDoctor._id || apiDoctor.id, // Ensure we have the doctor ID
      profilePic: apiDoctor.profilePicture || "/images/default-doctor.png",
      name: fullName,
      rating: apiDoctor.averageRating || 0, // Default or calculate from reviews if available
      qualification: qualification,
      specialization: specialization,
      experience: experienceText,
      votes: apiDoctor.votes || 0, // Default or get from reviews if available
      location: "Lokalizacja", // Add if available in API
      hospital: "Szpital", // Add if available in API
      hospitalRating: 5, // Default or calculate if available
      waitTime: "Maksymalny czas oczekiwania 15 minut", // Default or get from API if available
      price: `$${apiDoctor.consultationFee || 0}`,
      biography: apiDoctor.bio || "",
      education: [], // Empty array as it's not in the API response
      experienceList: [], // Empty array as it's not in the API response
      achievements: [], // Empty array as it's not in the API response
    };
  };

  const handleSaveServices = async (servicesData) => {
    try {
      setIsUpdating(true);
      showLoader();

      // Format services data for the API
      const formattedServices = servicesData.services.map((service) => ({
        serviceId: service.serviceId,
        price: parseFloat(service.price),
        notes: service.notes || "",
        serviceModel: service.serviceModel || "Service",
      }));

      //("doctor data", doctorData);

      // Call API to save doctor services
      const response = await userServiceHelper.addDoctorServices(
        doctorData.id,
        formattedServices
      );

      if (response) {
        // Update local state with the response data
        await fetchDoctorData();

        // Show success message
        toast.success("Usługi lekarza zostały zaktualizowane pomyślnie");
      } else {
        toast.error(response.message || "Nie udało się zapisać usług lekarza");
      }

      setIsServiceModalOpen(false);
      setServiceCatalogKind(null);
    } catch (error) {
      console.error("Error saving doctor services:", error);
      toast.error("Nie udało się zapisać usług lekarza");
    } finally {
      setIsUpdating(false);
      hideLoader();
    }
  };

  // Handle doctor service deletion
  const initiateServiceDeletion = (serviceId) => {
    setServiceToDelete(serviceId);
    setIsConfirmModalOpen(true);
  };
  
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      setIsUpdating(true);
      showLoader();
      
      await userServiceHelper.removeDoctorService(doctorData.id, serviceToDelete);
      
      // Update the local state to remove the deleted service
      const updatedServices = selectedServices.filter(
        (service) => service.serviceId !== serviceToDelete
      );
      
      setSelectedServices(updatedServices);
      
      toast.success("Usługa została pomyślnie usunięta");
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Nie udało się usunąć usługi");
    } finally {
      setIsUpdating(false);
      hideLoader();
      setServiceToDelete(null);
    }
  };

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!doctorData)
    return (
      <div className="p-6 text-center">Brak dostępnych danych lekarza</div>
    );

  return (
    <>
      <div className="flex justify-between items-center p-6">
        <h1 className="text-[#80c5c5] font-medium flex items-center gap-2 text-xl">
          <FaArrowLeftLong
            className="font-normal cursor-pointer"
            onClick={() => {
              navigate("/lekarze");
            }}
          />
          Wizyta Lekarska / {doctorData.name}
        </h1>
        
        <button
          onClick={() => setIsCatalogChooserOpen(true)}
          className="py-2.5 px-4 rounded-lg text-white bg-[#80c5c5] hover:bg-[#6ab3b3] transition-colors flex items-center justify-center gap-2 shadow-md text-sm font-medium"
        >
          <FaPlus size={14} />
          Wybierz Usługi dla Lekarza
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0">
        <div className="md:col-span-1 space-y-4">
          <DoctorCard data={doctorData} />
          <AvailableTime data={doctorData} />
        </div>
        <div className="md:col-span-2">
          <DoctorBackground 
            data={{ ...doctorData, selectedServices }} 
            onDeleteService={initiateServiceDeletion}
            onAddServices={() => setIsCatalogChooserOpen(true)}
          />
        </div>
      </div>

      {isCatalogChooserOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Wybierz katalog usług
              </h2>
              <button
                type="button"
                onClick={() => setIsCatalogChooserOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Zamknij"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Usługi na stronie i usługi systemowe są osobne — nie miesza się ich w jednym widoku.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setServiceCatalogKind("website");
                  setIsCatalogChooserOpen(false);
                  setIsServiceModalOpen(true);
                }}
                className="text-left border rounded-xl p-5 hover:shadow-md hover:border-teal-400 transition-all"
              >
                <Globe className="h-9 w-9 text-teal-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Usługi na stronie
                </h3>
                <p className="text-sm text-gray-500">
                  Oferta publiczna: zdjęcia, opisy, kafelki na stronie internetowej.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceCatalogKind("system");
                  setIsCatalogChooserOpen(false);
                  setIsServiceModalOpen(true);
                }}
                className="text-left border rounded-xl p-5 hover:shadow-md hover:border-slate-400 transition-all"
              >
                <Wrench className="h-9 w-9 text-slate-700 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Usługi systemowe
                </h3>
                <p className="text-sm text-gray-500">
                  Katalog techniczny do rozliczeń. Lista bez strony i zdjęć.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {isServiceModalOpen && (
        <ServiceSelectionModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setServiceCatalogKind(null);
          }}
          onSave={handleSaveServices}
          patientId={doctorData.id}
          catalogKind={serviceCatalogKind}
        />
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteService}
        title="Potwierdź usunięcie"
        message="Czy na pewno chcesz usunąć tę usługę dla lekarza? Ta operacja jest nieodwracalna."
      />
    </>
  );
}

// Left column: only photo, name, specialization
const DoctorCard = ({ data }) => (
  <div className="text-center p-4 w-full shadow rounded-lg flex flex-col gap-2">
    <div className="relative inline-block w-fit mx-auto rounded-full">
      <img
        src={data.profilePic}
        alt="Lekarz"
        className="mx-auto size-28 border border-white shadow-md object-cover rounded-full p-0.5"
      />
      <RiVerifiedBadgeFill className="absolute bottom-2 right-2 text-blue-500 text-xl" />
    </div>
    <h2 className="text-lg font-semibold">{data.name}</h2>
    <p className="text-sm text-gray-600">{data?.specialization || "Ogólny"}</p>
  </div>
);

const AvailableTime = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!data || !data.id) return;

      try {
        setIsLoading(true);
        showLoader();

        // Format date as YYYY-MM-DD for API
        const formattedDate = selectedDate.toISOString().split("T")[0];

        //("date", selectedDate, formattedDate);
        const response = await doctorService.getDoctorAvailableSlots(
          data.id,
          formattedDate
        );

        setAvailableSlots(response.data.data || []);
      } catch (err) {
        console.error("Błąd podczas pobierania dostępnych terminów:", err);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
        hideLoader();
      }
    };

    fetchAvailableSlots();
  }, [data, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Format time in 24-hour format (Polish standard)
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const m = minutes != null && minutes !== "" ? String(minutes).padStart(2, "0") : "00";
    return `${String(h).padStart(2, "0")}:${m}`;
  };

  return (
    <div className="p-4 mt-4 shadow rounded-lg flex flex-col gap-2">
      <h3 className="text-lg font-semibold pb-2 border-b">Dostępne Terminy</h3>
      {/* <p className="font-semibold">{data.hospital}</p> */}
      {/* <div className="flex justify-between text-sm font-medium items-center">
        <div className="flex w-full gap-4 items-center">
          <p className="text-gray-700 bg-[#e6f4f4] rounded px-3 py-1 flex gap-2 items-center">
            {data.hospitalRating}
            <IoIosStar className="text-[#deae37]" />
          </p>
          <p>{data.waitTime}</p>
        </div>
        <p className="text-right">{data.price}</p>
      </div> */}
      {/* <p className="text-sm  mb-4">{data.location}</p> */}
      <Calendar onDateSelect={handleDateSelect} />

      {isLoading ? (
        <div className="text-center py-4">Ładowanie dostępnych terminów...</div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {availableSlots.map((slot, i) => (
            <span
              key={i}
              className={`rounded py-2.5 text-sm text-center ${
                slot.available
                  ? "hover:bg-[#80c5c5] shadow cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {formatTime(slot.startTime)}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          Brak dostępnych terminów dla tej daty
        </div>
      )}

      {/* <button className="mt-4 py-2 px-4 rounded-lg text-white w-fit mx-auto bg-[#80c5c5] flex items-center justify-center gap-2">
        <FaPlus />
        Umów Wizytę
      </button> */}
    </div>
  );
};

const DoctorBackground = ({ data, onDeleteService, onAddServices }) => {
  const [listKind, setListKind] = useState("all");
  const allServices = data.selectedServices || [];
  const visibleServices =
    listKind === "website"
      ? allServices.filter((s) => s.source !== "system")
      : listKind === "system"
        ? allServices.filter((s) => s.source === "system")
        : allServices;
  const showTaxColumn =
    listKind === "system" ||
    visibleServices.some((s) => s.source === "system");

  return (
    <div className="p-4">
      <section className="bg-white shadow rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Usługi Lekarza</h3>
          <button
            onClick={onAddServices}
            className="text-sm text-[#80c5c5] hover:text-[#6ab3b3] flex items-center gap-1"
          >
            <FaPlus size={12} />
            Dodaj usługi
          </button>
        </div>
        {allServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setListKind("all")}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                listKind === "all"
                  ? "bg-[#80c5c5] text-white border-[#80c5c5]"
                  : "border-gray-200 text-gray-600 hover:border-teal-300"
              }`}
            >
              Wszystkie
            </button>
            <button
              type="button"
              onClick={() => setListKind("website")}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                listKind === "website"
                  ? "bg-[#80c5c5] text-white border-[#80c5c5]"
                  : "border-gray-200 text-gray-600 hover:border-teal-300"
              }`}
            >
              Usługi na stronie
            </button>
            <button
              type="button"
              onClick={() => setListKind("system")}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                listKind === "system"
                  ? "bg-slate-700 text-white border-slate-700"
                  : "border-gray-200 text-gray-600 hover:border-slate-400"
              }`}
            >
              Usługi systemowe
            </button>
          </div>
        )}
        {allServices.length > 0 ? (
          visibleServices.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
              {listKind === "system"
                ? "Brak usług systemowych dla tego lekarza"
                : "Brak usług ze strony dla tego lekarza"}
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Nazwa usługi
                    </th>
                    <th className="border-b px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Cena (zł)
                    </th>
                    {showTaxColumn && (
                      <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">
                        VAT
                      </th>
                    )}
                    <th className="border-b px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleServices.map((service) => (
                    <tr key={service.serviceId} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-3 text-sm">
                        <div>{service.title}</div>
                        {listKind === "all" && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {service.source === "system"
                              ? "Usługa systemowa"
                              : "Usługa na stronie"}
                          </div>
                        )}
                      </td>
                      <td className="border-b px-4 py-3 text-sm text-right font-medium">
                        {service.price}
                      </td>
                      {showTaxColumn && (
                        <td className="border-b px-4 py-3 text-sm text-gray-600">
                          {service.source === "system"
                            ? formatCatalogTax(service.tax)
                            : "—"}
                        </td>
                      )}
                      <td className="border-b px-4 py-3 text-center">
                        <button
                          onClick={() => onDeleteService(service.serviceId)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
            <p className="mb-3">Brak wybranych usług dla tego lekarza</p>
            <button
              onClick={onAddServices}
              className="text-sm text-white bg-[#80c5c5] hover:bg-[#6ab3b3] px-3 py-1.5 rounded inline-flex items-center gap-1"
            >
              <FaPlus size={12} />
              Dodaj pierwsze usługi
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
