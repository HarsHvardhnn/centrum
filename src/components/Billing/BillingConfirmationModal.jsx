import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import patientServicesHelper from "../../helpers/patientServicesHelper";
import { toast } from "sonner";
import ServiceSelectionModal from "../Doctor/SingleDoctor/patient-details/ServiceSelectionModal";

const BillingConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  patientServicesData,
  patientName,
  appointmentId,
  patientId,

}) => {
  console.log(appointmentId,patientId, "patientServicesData");
  const [isLoading, setIsLoading] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(18);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additionalChargeNote, setAdditionalChargeNote] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (isOpen && patientId && appointmentId) {
      console.log(patientId,appointmentId, "patientId,appointmentId");
      fetchPatientServices();
    }
  }, [isOpen, patientId, appointmentId]);

  const fetchPatientServices = async () => {
    try {
      setIsLoading(true);
      const response = await patientServicesHelper.getPatientServices(patientId, { appointmentId });
      
      console.log(response.data.services,response,response.data, "response.data.services");
      if (response && response.data && response.data.services) {
        const formattedServices = response.data.services.map(serviceItem => ({
          serviceId: serviceItem.service._id,
          _id: serviceItem._id,
          title: serviceItem.service.title,
          price: serviceItem.service.price,
          quantity: serviceItem.quantity || 1,
          totalPrice: (parseFloat(serviceItem.service.price) * (serviceItem.quantity || 1)).toFixed(2),
          status: serviceItem.status,
          notes: serviceItem.notes
        }));
        
        setServices(formattedServices);
      }
    } catch (error) {
      console.error("Error fetching patient services:", error);
      toast.error("Failed to load patient services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddServices = async (servicesData) => {
    try {
      setIsLoading(true);
      
      const servicesToAdd = servicesData.services.map(service => ({
        serviceId: service.serviceId,
        quantity: service.quantity,
        notes: "",
        status: "active"
      }));
      
      await patientServicesHelper.addServicesToPatient(patientId, servicesToAdd, { appointmentId });
      await fetchPatientServices();
      setShowServiceModal(false);
      toast.success("Usługi dodane pomyślnie");
    } catch (error) {
      console.error("Error adding services:", error);
      toast.error("Failed to add services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveService = async (serviceId) => {
    try {
      setIsLoading(true);
      await patientServicesHelper.removeServiceFromPatient(patientId, serviceId, { appointmentId });
      await fetchPatientServices();
      toast.success("Service removed successfully");
    } catch (error) {
      console.error("Error removing service:", error);
      toast.error("Failed to remove service");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate totals
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generuj rachunek dla {patientName}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Utworzy to rachunek dla pacjenta na podstawie wybranych usług.
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
                          <p className="font-medium text-sm">
                            {service.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ilość: {service.quantity} | Status: {service.status === 'active' ? 'Aktywna' : service.status === 'completed' ? 'Zakończona' : service.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm">
                            zł{service.totalPrice}
                          </p>
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

              {/* Tax, Additional Charges, and Discount Fields */}
              <div className="space-y-3 mb-4">
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
                      (zł{taxAmount.toFixed(2)})
                    </span>
                  </div>
                </div>

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
              </div>

              {/* Total */}
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
              onClick={() =>
                onConfirm({
                  services,
                  subtotal,
                  taxPercentage,
                  taxAmount,
                  additionalCharges,
                  additionalChargeNote,
                  discount,
                  totalAmount,
                  paymentMethod,
                })
              }
              disabled={isLoading || services.length === 0}
            >
              <DollarSign size={16} className="mr-1" />
              Generuj rachunek
            </button>
          </div>
        </div>
      </div>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleAddServices}
        patientId={patientId}
        appointmentId={appointmentId}
        existingServices={services}
      />
    </div>
  );
};

export default BillingConfirmationModal; 