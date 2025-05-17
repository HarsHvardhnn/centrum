// FormContext.jsx
import { createContext, useContext, useState } from 'react';

const FormContext = createContext(null);

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    // Demographics
    fullName: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    motherTongue: "",
    govtId: "",
    hospId: "Auto generate",
    sex: "",
    maritalStatus: "",
    ethnicity: "",
    otherHospitalIds: "",
    smsConsentAgreed: false,

    consents: [],
    documents: [],
    // Referrer
    referrerType: "",
    mainComplaint: "",
    referrerName: "",
    referrerNumber: "",
    referrerEmail: "",
    consultingSpecialization: "",
    consultingDoctor: "",

    // Address
    address: "",
    city: "",
    pinCode: "",
    state: "",
    country: "",
    district: "",
    isInternationalPatient: false,

    // Photo
    photo: null,

    // Details
    fatherName: "",
    motherName: "",
    spouseName: "",
    education: "",
    alternateContact: "",
    birthWeight: "",
    occupation: "",
    religion: "",
    ivrLanguage: "",

    // Notes
    reviewNotes: "",
  });

  const updateFormData = (fieldName, value) => {
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
  };

  const updateMultipleFields = (fields) => {
    setFormData(prevData => ({
      ...prevData,
      ...fields
    }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, updateMultipleFields }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
