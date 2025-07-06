import React, { useState, useEffect } from "react";
import Calendar from "./SingleDoctor/Calendar";
import { GoDotFill } from "react-icons/go";
import { IoIosStar } from "react-icons/io";
import { FiThumbsUp } from "react-icons/fi";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaPlus, FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import doctorService from "../../helpers/doctorHelper";
import { useLoader } from "../../context/LoaderContext";
import ServiceSelectionModal from "./SingleDoctor/patient-details/ServiceSelectionModal";
import { toast } from "sonner";
import { apiCaller } from "../../utils/axiosInstance";
import userServiceHelper from "../../helpers/userServiceHelper";

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
              servicesResponse.data.data.services.map((s) => ({
                serviceId: s.service._id,
                title: s.service.title,
                price: s.price,
                notes: s.notes || "",
              }))
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

      // Close modal
      setIsServiceModalOpen(false);
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
              navigate("/doctors");
            }}
          />
          Wizyta Lekarska / {doctorData.name}
        </h1>
        
        {/* Button to open services modal - moved to top right */}
        <button
          onClick={() => setIsServiceModalOpen(true)}
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
            setIsServiceModalOpen={setIsServiceModalOpen}
          />
        </div>
      </div>

      {/* Service Selection Modal */}
      {isServiceModalOpen && (
        <ServiceSelectionModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={handleSaveServices}
          patientId={doctorData.id} // We're using the same component, but for doctors
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

// Other components remain unchanged
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
    {/* Commenting out rating section as it's not being used
    <p className="text-sm font-medium text-gray-700 bg-[#e6f4f4] rounded w-fit mx-auto px-3 py-1 flex gap-2 items-center">
      <IoIosStar className="text-[#deae37] " />
      {data.rating}
    </p>
    */}
    <p className="text-sm">{data?.qualification}</p>
    <p className="text-sm">{data?.specialization || "Ogólny"}</p>
    <p className="text-sm">{data?.experience}</p>
    {/* Commenting out votes and reviews section as it's not being used
    <p className="mt-4 font-medium text-sm flex items-center justify-center gap-2">
      <FiThumbsUp className="text-lg" />
      98% ({data.votes} głosów)
    </p>
    */}
    <p className="font-medium mb-4 text-sm flex items-center justify-center gap-2">
      <MdOutlineVerifiedUser className="text-lg" />
      Rejestracja Medyczna Zweryfikowana
    </p>
    {/* Commenting out share review button as it's not being used
    <button className="w-full font-medium text-[#99d1d1] underline">
      Podziel się swoją opinią
    </button>
    */}
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

  // Format time from 24h to 12h format
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
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

const DoctorBackground = ({ data, onDeleteService ,setIsServiceModalOpen}) => {
  const [docData, setData] = useState(
    data || {
      services: [],
      specializations: [],
    }
  );

  // Helper function to determine if a section should be shown
  const shouldShowSection = (section) => {
    return section && section.length > 0;
  };

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Biografia</h3>
        <div className="text-sm text-gray-700 max-h-[300px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-line">{data.biography}</p>
        </div>
      </section>

      {shouldShowSection(data.education) && (
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Edukacja</h3>
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex items-start gap-2 mb-4">
                <GoDotFill className="text-teal-600 " />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm">{edu.institute}</p>
                  <p className="text-sm text-gray-600">{edu.degree}</p>
                  <p className="text-sm text-gray-500">{edu.duration}</p>
                </div>
              </div>
            ))}
          </div>

          {shouldShowSection(data.experienceList) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Praca i Doświadczenie
              </h3>
              {data.experienceList.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-2 mb-4">
                  <GoDotFill className="text-teal-600" />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm">{exp.workplace}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <hr className="my-6" />

      {shouldShowSection(data.achievements) && (
        <section className="border-b pb-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Osiągnięcia</h3>
            <div className="flex gap-4">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="flex w-full items-start gap-4 mb-4">
                  <GoDotFill className="text-teal-600 size-6" />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm">{ach.title}</p>
                    <p className="text-sm font-medium">{ach.date}</p>
                    <p className="text-sm text-gray-600">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Selected Services Section */}
      <section className="bg-white shadow rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Usługi Lekarza</h3>
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="text-sm text-[#80c5c5] hover:text-[#6ab3b3] flex items-center gap-1"
          >
            <FaPlus size={12} />
            Dodaj usługi
          </button>
        </div>
        {data.selectedServices && data.selectedServices.length > 0 ? (
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
                  <th className="border-b px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.selectedServices.map((service, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border-b px-4 py-3 text-sm">
                      {service.title}
                    </td>
                    <td className="border-b px-4 py-3 text-sm text-right font-medium">
                      {service.price}
                    </td>
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
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
            <p className="mb-3">Brak wybranych usług dla tego lekarza</p>
            <button
              onClick={() => setIsServiceModalOpen(true)}
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
