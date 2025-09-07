import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, AlertCircle, Info } from "lucide-react";
import { useLoader } from "../../context/LoaderContext";
import appointmentConfigService from "../../helpers/appointmentConfigHelper";

const AppointmentConfigPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all configuration settings
  useEffect(() => {
    fetchConfigurations();
  }, []);

  // Track changes to determine if save button should be enabled
  useEffect(() => {
    const hasAnyChanges = Object.keys(editedValues).length > 0;
    setHasChanges(hasAnyChanges);
  }, [editedValues]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader();

      const response = await appointmentConfigService.getAllConfigs();
      if (response.success) {
        setConfigs(response.data);
        
        // Initialize editedValues with current values
        const initialValues = {};
        response.data.forEach(config => {
          initialValues[config.key] = config.value;
        });
        setEditedValues(initialValues);
      } else {
        setError("Nie udało się pobrać konfiguracji.");
      }
    } catch (err) {
      console.error("Error fetching configurations:", err);
      setError("Wystąpił błąd podczas pobierania konfiguracji.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Handle input change for configuration values
  const handleInputChange = (key, value, valueType) => {
    let processedValue = value;
    
    // Convert value based on its type
    if (valueType === "number") {
      processedValue = value === "" ? "" : Number(value);
    } else if (valueType === "boolean") {
      processedValue = value === "true";
    }
    
    setEditedValues(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  // Save all changed configuration values
  const handleSaveAll = async () => {
    try {
      showLoader();
      setError(null);
      
      const changedKeys = Object.keys(editedValues);
      if (changedKeys.length === 0) {
        toast.info("Brak zmian do zapisania");
        return;
      }
      
      const savePromises = changedKeys.map(key => {
        const config = configs.find(c => c.key === key);
        if (config && config.value !== editedValues[key]) {
          return appointmentConfigService.updateConfig(key, { value: editedValues[key] });
        }
        return null;
      }).filter(Boolean);
      
      if (savePromises.length === 0) {
        toast.info("Brak zmian do zapisania");
        return;
      }
      
      const results = await Promise.all(savePromises);
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast.success("Wszystkie zmiany zostały zapisane");
        fetchConfigurations(); // Refresh data
      } else {
        toast.error("Nie udało się zapisać niektórych zmian");
        // Refresh to get current state
        fetchConfigurations();
      }
    } catch (err) {
      console.error("Error saving configurations:", err);
      toast.error("Wystąpił błąd podczas zapisywania konfiguracji");
    } finally {
      hideLoader();
    }
  };

  // Reset a single configuration to its default value
  const handleReset = async (key) => {
    try {
      showLoader();
      
      const response = await appointmentConfigService.resetConfig(key);
      
      if (response.success) {
        toast.success(`Konfiguracja ${key} została zresetowana do wartości domyślnej`);
        
        // Update local state
        setConfigs(prev => 
          prev.map(config => 
            config.key === key ? { ...config, value: response.data.value } : config
          )
        );
        
        // Update edited values
        setEditedValues(prev => ({
          ...prev,
          [key]: response.data.value
        }));
      } else {
        toast.error(`Nie udało się zresetować konfiguracji ${key}`);
      }
    } catch (err) {
      console.error(`Error resetting configuration ${key}:`, err);
      toast.error(`Wystąpił błąd podczas resetowania konfiguracji ${key}`);
    } finally {
      hideLoader();
    }
  };

  // Check if a value has been changed from its original
  const isValueChanged = (key) => {
    const config = configs.find(c => c.key === key);
    return config && editedValues[key] !== undefined && config.value !== editedValues[key];
  };

  // Render input field based on value type
  const renderInputField = (config) => {
    const { key, valueType, validation, editable } = config;
    const value = editedValues[key] !== undefined ? editedValues[key] : config.value;
    
    if (!editable) {
      return <div className="text-gray-500 italic">{value.toString()}</div>;
    }
    
    switch (valueType) {
      case "string":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          />
        );
      
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            min={config.validation?.min}
            max={config.validation?.max}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          />
        );
      
      case "boolean":
        return (
          <select
            value={value.toString()}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          >
            <option value="true">Tak</option>
            <option value="false">Nie</option>
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value.toString()}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          />
        );
    }
  };

  // Group configurations by category
  const groupedConfigs = configs.reduce((acc, config) => {
    const category = config.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(config);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-teal-700 mb-6">Konfiguracja Wizyt</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-blue-800">Informacja</h3>
            <p className="text-sm text-blue-700">
              Ta strona pozwala na zarządzanie konfiguracją systemu wizyt. Zmiany w tych ustawieniach
              wpłyną na działanie całego systemu. Używaj z rozwagą.
            </p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges}
              className={`flex items-center px-4 py-2 rounded-lg ${
                hasChanges 
                  ? 'bg-teal-600 text-white hover:bg-teal-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={16} className="mr-2" />
              Zapisz wszystkie zmiany
            </button>
          </div>
          
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
                {category === 'appointment' ? 'Wizyty' : category}
              </h2>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nazwa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wartość
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opis
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryConfigs.map((config) => (
                      <tr key={config.key} className={isValueChanged(config.key) ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{config.displayName || config.key}</div>
                          <div className="text-xs text-gray-500">{config.key}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderInputField(config)}
                          {config.validation && (
                            <div className="text-xs text-gray-500 mt-1">
                              {config.validation.min !== undefined && config.validation.max !== undefined
                                ? `Min: ${config.validation.min}, Maks: ${config.validation.max}`
                                : config.validation.min !== undefined
                                ? `Min: ${config.validation.min}`
                                : config.validation.max !== undefined
                                ? `Maks: ${config.validation.max}`
                                : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{config.description}</div>
                          <div className="text-xs text-gray-500 mt-1">Typ: {config.valueType}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {config.editable && (
                            <button
                              onClick={() => handleReset(config.key)}
                              className="text-blue-600 hover:text-blue-800 flex items-center ml-auto"
                              title="Resetuj do wartości domyślnej"
                            >
                              <RotateCcw size={16} />
                              <span className="ml-1">Resetuj</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AppointmentConfigPage;
