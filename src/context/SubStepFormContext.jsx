// FormContext.jsx
import { createContext, useContext, useState } from 'react';

const FormContext = createContext(null);

export const FormProvider = ({ children, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    // Demographics
    fullName: "",
    email: "",
    mobileNumber: "",
    phoneCode: "+48",
    dateOfBirth: "",
    motherTongue: "",
    govtId: "",
    hospId: "Auto generate",
    sex: "",
    maritalStatus: "",
    ethnicity: "",
    otherHospitalIds: "",
    smsConsentAgreed: false,
    appointmentSpecificDocument:"",

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
    contactPerson1Name: "",
    contactPerson1PhoneCode: "+48",
    contactPerson1Phone: "",
    contactPerson1Address: "",
    contactPerson1Pesel: "",
    contactPerson2Name: "",
    contactPerson2PhoneCode: "+48",
    contactPerson2Phone: "",
    contactPerson2Address: "",
    contactPerson2Pesel: "",
    allergies: "",
    preferredLanguage: "",

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
