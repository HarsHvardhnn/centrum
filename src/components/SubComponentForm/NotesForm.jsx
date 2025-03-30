// NotesForm.jsx

import { useFormContext } from "../../context/SubStepFormContext";

const NotesForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
        <textarea 
          name="reviewNotes"
          value={formData.reviewNotes}
          onChange={handleChange}
          placeholder="Enter your note..." 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-36"
        ></textarea>
      </div>
      
      <div className="flex items-center mt-4">
        <input 
          type="checkbox" 
          id="international-patient" 
          name="isInternationalPatient"
          checked={formData.isInternationalPatient}
          onChange={handleChange}
          className="h-4 w-4 text-teal-500 border-gray-300 rounded"
        />
        <label htmlFor="international-patient" className="ml-2 text-sm text-gray-700">
          International Patient
        </label>
      </div>
    </div>
  );
};

export default NotesForm;
