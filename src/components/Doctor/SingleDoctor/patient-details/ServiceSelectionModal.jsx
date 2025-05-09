import React, { useState, useEffect } from "react";
import { X, Plus, Minus, CheckCircle, AlertCircle } from "lucide-react";
import { useServices } from "../../../../context/serviceContext";

const ServiceSelectionModal = ({ isOpen, onClose, onSave, patientId }) => {
  const { services, loading, error } = useServices();
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedServices([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  const toggleService = (service) => {
    const isSelected = selectedServices.some(s => s.serviceId === service._id);
    
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.serviceId !== service._id));
    } else {
      setSelectedServices([...selectedServices, { 
        serviceId: service._id,
        title: service.title, 
        price: service.price,
        quantity: 1 
      }]);
    }
  };

  const updateQuantity = (serviceId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedServices(selectedServices.map(service => 
      service.serviceId === serviceId 
        ? { ...service, quantity: newQuantity }
        : service
    ));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + (parseFloat(service.price) * service.quantity);
    }, 0).toFixed(2);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      const servicesData = {
        patientId,
        services: selectedServices.map(s => ({
          serviceId: s.serviceId,
          title: s.title,
          price: s.price,
          quantity: s.quantity,
          totalPrice: (parseFloat(s.price) * s.quantity).toFixed(2)
        }))
      };
      
      await onSave(servicesData);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving services:", error);
      setIsSubmitting(false);
    }
  };

  const filteredServices = searchTerm 
    ? services.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : services;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-medium text-gray-900">Wybierz usługi dla pacjenta</h3>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Szukaj usług..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Services List */}
          <div className="w-1/2 overflow-y-auto border-r p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle size={24} className="text-red-500 mb-2" />
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Nie znaleziono usług</div>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.some(s => s.serviceId === service._id);
                  return (
                    <div 
                      key={service._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-teal-50 border border-teal-200" 
                          : "bg-white border border-gray-100 hover:border-teal-200"
                      }`}
                      onClick={() => toggleService(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          {service.shortDescription && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {service.shortDescription}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center ml-4">
                          {isSelected && <CheckCircle size={18} className="text-teal-500 mr-2" />}
                          <span className="font-medium text-gray-900">{service.price} zł</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Services */}
          <div className="w-1/2 overflow-y-auto p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 mb-3">Wybrane usługi</h3>
              
              {selectedServices.length === 0 ? (
                <div className="text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  Nie wybrano żadnych usług
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedServices.map((service) => (
                    <div key={service.serviceId} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-500">{service.price} zł / szt.</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleService({_id: service.serviceId, ...service});
                          }}
                          className="text-gray-400 hover:text-red-500 focus:outline-none"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(service.serviceId, service.quantity - 1);
                          }}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2 min-w-[40px] text-center">{service.quantity}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(service.serviceId, service.quantity + 1);
                          }}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                        <div className="ml-auto font-medium">
                          {(parseFloat(service.price) * service.quantity).toFixed(2)} zł
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Total and Actions */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-800">Suma:</span>
                <span className="font-bold text-lg text-gray-900">{calculateTotal()} zł</span>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedServices.length === 0 || isSubmitting}
                  className={`px-4 py-2 rounded-lg text-white flex items-center justify-center ${
                    selectedServices.length === 0 || isSubmitting
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-600"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Zapisywanie...
                    </>
                  ) : (
                    "Zapisz"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal; 