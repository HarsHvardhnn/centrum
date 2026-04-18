import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
  /** When set, after generating a bill navigate here (e.g. /administracja, /pacjenci, /klinika, /lekarze/wizyty/:id) instead of billing page */
  returnPath,
}) => {
  //(appointmentId,patientId, "patientServicesData");
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [additionalChargeNote, setAdditionalChargeNote] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (isOpen && patientId && appointmentId) {
      //(patientId,appointmentId, "patientId,appointmentId");
      fetchPatientServices();
    }
  }, [isOpen, patientId, appointmentId]);

  const fetchPatientServices = async () => {
    try {
      setIsLoading(true);
      const response = await patientServicesHelper.getPatientServices(patientId, { appointmentId });
      
      //(response.data.services,response,response.data, "response.data.services");
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
      toast.error("Could not load patient services");
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
      toast.success("Services added successfully");
    } catch (error) {
      console.error("Error adding services:", error);
      toast.error("Could not add services");
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
      toast.error("Could not remove service");
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
            Generate bill for {patientName}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This creates a bill for the patient based on the selected services.
          </p>

          {isLoading ? (
            <div className="py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                  <h4 className="font-medium text-sm">Services</h4>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add service
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
                            Qty: {service.quantity} | Status: {service.status === 'active' ? 'Active' : service.status === 'completed' ? 'Completed' : service.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm">
                            PLN {service.totalPrice}
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
                      <p className="font-medium">Subtotal</p>
                      <p className="font-medium">PLN {subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No services found for this visit.
                  </div>
                )}
              </div>

              {/* Tax, Additional Charges, and Discount Fields */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax (%)
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
                      ({taxPercentage === 0 ? "Exempt" : `PLN ${taxAmount.toFixed(2)}`})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional charges (PLN)
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
                      placeholder="Note (optional)"
                      value={additionalChargeNote}
                      onChange={(e) => setAdditionalChargeNote(e.target.value)}
                      className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (PLN)
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
                    Payment method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/debit card</option>
                    <option value="insurance">Insurance</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="mobile_payment">Mobile payment</option>
                  </select>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Total</p>
                  <p className="font-bold text-lg text-teal-600">
                    PLN {totalAmount}
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
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center"
              onClick={async () => {
                try {
                  await onConfirm({
                    services,
                    subtotal,
                    taxPercentage,
                    taxAmount,
                    additionalCharges,
                    additionalChargeNote,
                    discount,
                    totalAmount,
                    paymentMethod,
                  });

                  onClose?.();
                  // Return to the view we started from (main panel, visit history, or doctor panel)
                  if (returnPath) {
                    navigate(returnPath);
                  } else if (location.pathname === "/administracja/rozliczenia") {
                    const today = new Date().toISOString().split("T")[0];
                    navigate(`/pacjenci?date=${today}`);
                  } else {
                    navigate(`/administracja/rozliczenia/?appointment=${appointmentId}&step=edit`);
                  }
                } catch (error) {
                  console.error("Error generating bill:", error);
                }
              }}
              disabled={isLoading || services.length === 0}
            >
              <DollarSign size={16} className="mr-1" />
              Generate bill
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