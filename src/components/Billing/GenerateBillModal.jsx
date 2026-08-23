import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import billingHelper from "../../helpers/billingHelper";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import { useUser } from "../../context/userContext";
import ServiceSelectionModal from "../Doctor/SingleDoctor/patient-details/ServiceSelectionModal";
import { formatPersonName } from "../../utils/formatPersonName";

function toDateInputValue(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveVisitDoctorUserId(appointment) {
  const doc = appointment?.doctor ?? appointment?.doctorId;
  if (!doc) return null;
  if (typeof doc === "string") return doc;
  return doc._id || doc.id || doc.userId || doc.user_id || null;
}

/**
 * Generate-bill modal. Kept at module scope so production minify cannot
 * close over parent consts (TDZ: "Cannot access 'O' before initialization").
 */
const GenerateBillModal = ({
  isOpen,
  onClose,
  appointmentId,
  onBillGenerated,
  isRedirectedFromAppointment,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isDoctorViewOnly = user?.role === "doctor";
  const showAdminInvoiceFields =
    user?.role === "admin" || user?.role === "receptionist";

  const [isLoading, setIsLoading] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additionalChargeNote, setAdditionalChargeNote] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [services, setServices] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(() => toDateInputValue());
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const suggestedInvoiceNumberRef = useRef("");

  const fetchPatientServices = async (patientId) => {
    try {
      const response = await patientServicesHelper.getPatientServices(patientId, {
        appointmentId,
      });

      if (response && response.data && response.data.services) {
        const formattedServices = response.data.services.map((serviceItem) => ({
          serviceId: serviceItem.service._id,
          _id: serviceItem._id,
          title: serviceItem.service.title,
          price: serviceItem.service.price,
          quantity: serviceItem.quantity || 1,
          totalPrice: (
            parseFloat(serviceItem.service.price) * (serviceItem.quantity || 1)
          ).toFixed(2),
          status: serviceItem.status,
          notes: serviceItem.notes,
        }));
        setServices(formattedServices);
      }
    } catch (error) {
      console.error("Error fetching patient services:", error);
      toast.error("Nie udało się załadować usług pacjenta");
    }
  };

  const fetchAppointmentData = async () => {
    try {
      setIsLoading(true);
      const appointmentResponse = await appointmentHelper.getAppointmentById(
        appointmentId
      );
      if (appointmentResponse.success) {
        setAppointment(appointmentResponse.data);
        setPatient(appointmentResponse.data.patient);
        await fetchPatientServices(appointmentResponse.data.patient._id);
      }
    } catch (error) {
      console.error("Error fetching appointment data:", error);
      toast.error("Nie udało się pobrać danych wizyty");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentData();
    }
  }, [isOpen, appointmentId]);

  useEffect(() => {
    if (!isOpen || !invoiceDate || !showAdminInvoiceFields) return;
    const [year, month] = invoiceDate.split("-").map(Number);
    if (!year || !month) return;
    let cancelled = false;
    (async () => {
      const suggested = await billingHelper.suggestInvoiceId(month, year);
      if (cancelled || !suggested) return;
      setInvoiceNumber((current) =>
        !current || current === suggestedInvoiceNumberRef.current
          ? suggested
          : current
      );
      suggestedInvoiceNumberRef.current = suggested;
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, invoiceDate, showAdminInvoiceFields]);

  const handleAddServices = async (servicesData) => {
    try {
      setIsLoading(true);
      const servicesToAdd = servicesData.services.map((service) => ({
        serviceId: service.serviceId,
        quantity: service.quantity,
        notes: "",
        status: "active",
      }));
      await patientServicesHelper.addServicesToPatient(
        patient._id,
        servicesToAdd,
        { appointmentId }
      );
      await fetchPatientServices(patient._id);
      setShowServiceModal(false);
      toast.success("Usługi dodane pomyślnie");
    } catch (error) {
      console.error("Error adding services:", error);
      toast.error("Nie udało się dodać usług");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveService = async (serviceId) => {
    try {
      setIsLoading(true);
      await patientServicesHelper.removeServiceFromPatient(
        patient._id,
        serviceId,
        { appointmentId }
      );
      await fetchPatientServices(patient._id);
      toast.success("Usługa usunięta pomyślnie");
    } catch (error) {
      console.error("Error removing service:", error);
      toast.error("Nie udało się usunąć usługi");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = services.reduce((sum, service) => {
    return sum + parseFloat(service.totalPrice || 0);
  }, 0);

  const taxAmount = (subtotal * taxPercentage) / 100;

  const totalAmount = (
    subtotal +
    taxAmount +
    parseFloat(additionalCharges || 0) -
    parseFloat(discount || 0)
  ).toFixed(2);

  const handleGenerateBill = async () => {
    if (Number(additionalCharges) > 0 && !String(additionalChargeNote || "").trim()) {
      toast.error("Opis dodatkowej opłaty jest wymagany.");
      return;
    }
    if (
      services.length === 0 &&
      !(Number(additionalCharges) > 0 && String(additionalChargeNote || "").trim())
    ) {
      toast.error("Wybierz usługę lub dodaj opłatę dodatkową z opisem.");
      return;
    }
    try {
      setIsLoading(true);
      const formattedServices = services.map((service) => ({
        serviceId: service.serviceId,
        title: service.title,
        price: service.price,
        status: service.status,
      }));
      const billingPayload = {
        services: formattedServices,
        subtotal,
        taxPercentage: showAdminInvoiceFields ? taxPercentage : 0,
        taxAmount: showAdminInvoiceFields ? taxAmount : 0,
        discount: parseFloat(discount) || 0,
        additionalCharges: parseFloat(additionalCharges) || 0,
        additionalChargeNote: additionalChargeNote || "",
        totalAmount,
        paymentMethod: showAdminInvoiceFields ? paymentMethod : "cash",
      };
      if (showAdminInvoiceFields) {
        billingPayload.billedAt = invoiceDate;
        billingPayload.invoiceId = invoiceNumber.trim();
      }
      const response = await billingHelper.generateBill(
        appointmentId,
        billingPayload
      );
      toast.success(
        `Rachunek wygenerowany pomyślnie na kwotę zł${totalAmount}`
      );
      onClose();
      onBillGenerated();
      if (!isRedirectedFromAppointment) {
        navigate(`/administracja/rozliczenia/szczegoly/${response.data._id}`);
      }
    } catch (error) {
      console.error("Failed to generate bill:", error);
      toast.error(
        error?.response?.data?.message ||
          "Nie udało się wygenerować rachunku. Spróbuj ponownie."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDoctorViewOnly
              ? "Rozliczenie wizyty"
              : `Generuj rachunek dla ${formatPersonName(patient)}`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isDoctorViewOnly
              ? "Wybierz wykonane usługi, aby utworzyć rozliczenie oczekujące na płatność."
              : "Utworzy to rachunek dla pacjenta na podstawie wybranych usług."}
          </p>

          {isLoading ? (
            <div className="py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                  <h4 className="font-medium text-sm">Usługi</h4>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Dodaj usługę
                  </button>
                </div>

                {services && services.length > 0 ? (
                  <div className="divide-y">
                    {services.map((service) => (
                      <div
                        key={service._id}
                        className="px-4 py-2 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-sm">{service.title}</p>
                          <p className="text-xs text-gray-500">
                            Ilość: {service.quantity} | Status:{" "}
                            {service.status === "active"
                              ? "Aktywna"
                              : service.status === "completed"
                                ? "Zakończona"
                                : service.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm">zł{service.totalPrice}</p>
                          <button
                            onClick={() => handleRemoveService(service.serviceId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="px-4 py-2 flex justify-between items-center bg-gray-50">
                      <p className="font-medium">Suma częściowa</p>
                      <p className="font-medium">zł{subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Nie znaleziono usług dla tej wizyty.
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                {showAdminInvoiceFields && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Podatek (%)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercentage}
                        onChange={(e) =>
                          setTaxPercentage(parseFloat(e.target.value) || 0)
                        }
                        className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        (
                        {taxPercentage === 0
                          ? "ZW"
                          : `zł${taxAmount.toFixed(2)}`}
                        )
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dodatkowe opłaty (zł)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={additionalCharges}
                      onChange={(e) =>
                        setAdditionalCharges(parseFloat(e.target.value) || 0)
                      }
                      className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Notatka (opcjonalna)"
                      value={additionalChargeNote}
                      onChange={(e) => setAdditionalChargeNote(e.target.value)}
                      className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rabat (zł)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>

                {showAdminInvoiceFields && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data wystawienia
                      </label>
                      <input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numer faktury
                      </label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="np. 17/08/2026"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Możesz nadać numer ręcznie. Puste pole nada kolejny numer
                        dla wybranej daty.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metoda płatności
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      >
                        <option value="cash">Gotówka</option>
                        <option value="card">Karta kredytowa/debetowa</option>
                        <option value="insurance">Ubezpieczenie</option>
                        <option value="bank_transfer">Przelew bankowy</option>
                        <option value="mobile_payment">Płatność mobilna</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Łączna kwota</p>
                  <p className="font-bold text-lg text-teal-600">
                    zł{totalAmount}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center"
              onClick={handleGenerateBill}
              disabled={
                isLoading ||
                (services.length === 0 &&
                  !(Number(additionalCharges) > 0 && additionalChargeNote.trim()))
              }
            >
              <DollarSign size={16} className="mr-1" />
              {isDoctorViewOnly ? "Rozlicz i zakończ wizytę" : "Generuj rachunek"}
            </button>
          </div>
        </div>
      </div>

      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleAddServices}
        patientId={patient?._id}
        doctorUserId={
          user?.role === "admin" ? null : resolveVisitDoctorUserId(appointment)
        }
      />
    </div>
  );
};

export default GenerateBillModal;
