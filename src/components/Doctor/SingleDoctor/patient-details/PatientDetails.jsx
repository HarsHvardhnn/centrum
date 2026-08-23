// PatientDetailsPage.jsx - Redesigned layout: visit header, two columns, footer
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate, useSearchParams, useBlocker } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PatientProfile from "./PatientProfile";
import ConsultationForm from "./ConsultationForm";
import ActionButtons from "./ActionButtons";
import ServiceSelectionModal from "./ServiceSelectionModal";
import ReportUploader from "./ReportUploader";
import ReportsList from "./ReportsList";
import VisitInfoHeader from "./VisitInfoHeader";
import PatientHeaderCard from "./PatientHeaderCard";
import VisitHistoryCard from "./VisitHistoryCard";
import LifeParamsCard from "./LifeParamsCard";
import DiagnosisCard from "./DiagnosisCard";
import ProceduresCard from "./ProceduresCard";
import DocumentationCard from "./DocumentationCard";
import NotesCard from "./NotesCard";
import MedicalDocumentsCard from "./MedicalDocumentsCard";
import SectionTemplatePickerModal from "./SectionTemplatePickerModal";
import GlobalTemplatePickerModal from "./GlobalTemplatePickerModal";
import PatientDetailsFooter from "./PatientDetailsFooter";
import BillingConfirmationModal from "../../../Billing/BillingConfirmationModal";
import { formatPersonName } from "../../../../utils/formatPersonName";
import patientService from "../../../../helpers/patientHelper";
import patientServicesHelper from "../../../../helpers/patientServicesHelper";
import appointmentHelper from "../../../../helpers/appointmentHelper";
import billingHelper from "../../../../helpers/billingHelper";
import { useLoader } from "../../../../context/LoaderContext";
import { MedicationsSection } from "./medications/MedicationSection";
import { TestsSection } from "./medications/TestSection";
import { Trash2, Calendar, PlusCircle, Info, X, FileText, Clock, User, Video, Activity, Save } from "lucide-react";
import { toast } from "sonner";
import { translateStatus, getVisitModeLabel, getVisitModeStyle, getVisitTypeDisplayLabel, stripDoctorTitle } from "../../../../utils/statusHelper";
import { resolveDocumentOpenUrl } from "../../../../utils/documentUrl";
import {
  isRadiologistAppointment,
  getRadiologistVisitTypeFields,
} from "../../../../utils/radiologistVisitHelper";
import { useAutoSave } from "../../../../hooks/useAutoSave";
import { useUser } from "../../../../context/userContext";
import {
  collectDoctorCatalogIds,
  loadDoctorAssignedCatalog,
} from "../../../../helpers/userServiceHelper";
import { queryKeys } from "../../../../lib/queryKeys";
import { fetchVisitDetails, unwrapVisitConsolidated } from "../../../../utils/visitNavigation";

/**
 * Build consultation payload for PUT /appointments/:id/details.
 * Header verification only updates `visitReasonVerified` state; ConsultationForm may only set
 * `visitTypeVerified` on `consultationData`. Without merging, both flags stay false from the last fetch.
 */
function mergeConsultationVerificationFlags(consultationData, visitReasonVerifiedState) {
  return {
    ...consultationData,
    visitReasonVerified:
      consultationData.visitReasonVerified === true ||
      visitReasonVerifiedState === true ||
      consultationData.visitTypeVerified === true,
    visitTypeVerified:
      consultationData.visitTypeVerified === true ||
      visitReasonVerifiedState === true ||
      consultationData.visitReasonVerified === true,
  };
}

/** Keep visit-type aliases in sync on patient details page. Source of truth: consultationType. */
function normalizeConsultationTypeAliases(consultationData) {
  if (!consultationData || typeof consultationData !== "object") return consultationData;
  const consultationType =
    consultationData.consultationType ??
    consultationData.visitReason ??
    consultationData.visitType ??
    "";
  return {
    ...consultationData,
    consultationType,
    visitReason: consultationType,
    visitType: consultationType,
  };
}

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

// Visit Card Confirmation Modal Component
const VisitCardConfirmationModal = ({ isOpen, onClose, onViewExisting, onGenerateNew, existingUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <FileText className="text-teal-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold">Karta wizyty już istnieje</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Dla tej wizyty została już wygenerowana karta wizyty. Czy chcesz wyświetlić istniejącą kartę, czy wygenerować nową?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            onClick={() => {
              onGenerateNew();
              onClose();
            }}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Wygeneruj nową
          </button>
          <button
            onClick={() => {
              onViewExisting();
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Wyświetl istniejącą
          </button>
        </div>
      </div>
    </div>
  );
};

// Add PatientDetailsModal component
const PatientDetailsModal = ({ isOpen, onClose, patientData }) => {
  if (!isOpen || !patientData) return null;

  // Helper function to check if a value is empty
  const isEmpty = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  };

  // Helper function to filter out empty fields
  const filterEmptyFields = (fields) => {
    return Object.entries(fields).reduce((acc, [key, value]) => {
      if (!isEmpty(value)) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("pl-PL", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const sections = {
    "Dane osobowe": filterEmptyFields({
      "Imię i nazwisko": `${patientData.name?.first || ""} ${patientData.name?.last || ""}`.trim(),
      "Email": patientData.email,
      "Telefon": (() => {
        const raw = patientData?.phone != null ? String(patientData.phone).trim() : "";
        const noPhone = !raw || /_no_phone_/i.test(raw) || raw.replace(/\D/g, "").length < 6;
        if (noPhone) return "—";
        return raw.startsWith("+") ? raw : `+${raw}`;
      })(),
      "PESEL": patientData.govtId || patientData.pesel || patientData.PESEL || "Nie określono",
      "Płeć": patientData.sex === "Male" ? "Mężczyzna" : patientData.sex === "Female" ? "Kobieta" : patientData.sex,
      "Data urodzenia": patientData.dateOfBirth ? formatDate(patientData.dateOfBirth) : null,
      "Wiek": patientData.age,
      "Nazwa użytkownika": patientData.username,
      "Dorosły": patientData.isAdult ? "Tak" : "Nie",
      "Zameldowany": patientData.checkedIn ? "Tak" : "Nie",
    }),
    "Dane medyczne": filterEmptyFields({
      "Alergie": patientData.allergies,
      "Status": translateStatus(patientData.status),
      "Pacjent międzynarodowy": (patientData.isInternational === true || patientData.isInternationalPatient === true) ? "Tak" : "Nie",
      "Zgoda na SMS": patientData.smsConsentAgreed ? "Tak" : "Nie",
      "Schorzenia przewlekłe": patientData.chronicConditions?.length > 0 ? patientData.chronicConditions.join(", ") : null,
      "Cele": patientData.goals?.length > 0 ? patientData.goals.join(", ") : null,
      "Historia medyczna": patientData.medicalHistory?.length > 0 ? patientData.medicalHistory.join(", ") : null,
    }),
    "Dane identyfikacyjne": filterEmptyFields({
      "ID pacjenta": patientData.patientId,
      "Data utworzenia": formatDate(patientData.createdAt),
      "Ostatnia aktualizacja": formatDate(patientData.updatedAt),
    }),
  };

  // International patient: document + npesei section (show when isInternational or isInternationalPatient)
  const isInternational = patientData.isInternational === true || patientData.isInternationalPatient === true;
  if (isInternational) {
    const docFields = filterEmptyFields({
      "NPESEI": patientData.npesei,
      "Kraj dokumentu": patientData.documentCountry,
      "Typ dokumentu": patientData.documentType,
      "Numer dokumentu": patientData.documentNumber,
      "Data urodzenia (z dokumentu)": patientData.documentDateOfBirth ? formatDate(patientData.documentDateOfBirth) : null,
      "Data ważności dokumentu": patientData.documentExpiryDate ? formatDate(patientData.documentExpiryDate) : null,
      "Obywatelstwo": patientData.citizenship,
      "Klucz dokumentu": patientData.internationalPatientDocumentKey,
    });
    if (Object.keys(docFields).length > 0) {
      sections["Dokument i identyfikacja (pacjent międzynarodowy)"] = docFields;
    }
  }

  console.log("patinet data",patientData)

  // Add appointment flags section if any of the 5 fields are true
  if (patientData.isWalkin || patientData.needsAttention || patientData.isBackdated || patientData.overrideConflicts || patientData.isEmergency) {
    sections["Informacje o wizycie"] = filterEmptyFields({
      "Pacjent bez wcześniejszej rezerwacji": patientData.isWalkin ? "Tak" : "Nie",
      "Wymaga szczególnej uwagi": patientData.needsAttention ? "Tak" : "Nie",
      "Wizyta nagła (priorytetowa)": patientData.isEmergency ? "Tak" : "Nie",
      "Pozwolono na daty z przeszłości": patientData.isBackdated ? "Tak" : "Nie",
      "Nadpisano konflikty czasowe": patientData.overrideConflicts ? "Tak" : "Nie",
    });
  }

  // Add consents section if there are any consents
  if (patientData.consents && patientData.consents.length > 0) {
    sections["Zgody pacjenta"] = {
      "Zgody": (
        <div className="space-y-2">
          {patientData.consents.map((consent) => (
            <div key={consent.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${consent.agreed ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{consent.text}</span>
            </div>
          ))}
        </div>
      )
    };
  }

  // Add documents section if there are any documents
  if (patientData.documents && patientData.documents.length > 0) {
    sections["Dokumenty"] = {
      "Dokumenty": (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {patientData.documents.map((doc, index) => (
            <div
              key={doc.id || index}
              className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow w-64 max-w-full relative group"
              onClick={() => {
                const url = resolveDocumentOpenUrl(doc);
                if (url) window.open(url, "_blank");
              }}
            >
              <div className="flex items-center gap-3">
                {doc.isPdf ? (
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-red-500" size={24} />
                  </div>
                ) : (
                  <img
                    src={doc.preview || doc.url}
                    alt={doc.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0 relative">
                  <p
                    className="text-sm font-medium truncate w-full"
                  >
                    {doc?.fileName?.split(".")[0] || doc?.name || "Bez nazwy"}
                  </p>
                  {/* Tooltip for full file name */}
                  <span
                    className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-pre-line max-w-xs break-words shadow-lg"
                    style={{ pointerEvents: 'none' }}
                  >
                    {doc?.fileName || doc?.name || "Bez nazwy"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    };
  }

  // Filter out sections with no data
  const filteredSections = Object.entries(sections).reduce((acc, [key, value]) => {
    if (!isEmpty(value)) {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Separate documents section from others
  const entries = Object.entries(filteredSections);
  const docIndex = entries.findIndex(([sectionTitle]) => sectionTitle === "Dokumenty");
  const docSection = docIndex !== -1 ? entries[docIndex] : null;
  const otherSections = docIndex !== -1 ? entries.filter((_, i) => i !== docIndex) : entries;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Szczegóły pacjenta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        {/* Main info grid (excluding documents) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherSections.map(([sectionTitle, fields]) => (
            <div key={sectionTitle} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">{sectionTitle}</h3>
              <div className="space-y-2">
                {Object.entries(fields).map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-sm text-gray-500">{label}</span>
                    {typeof value === 'object' && value !== null ? (
                      value
                    ) : (
                      <span className="text-sm font-medium">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Full-width documents section */}
        {docSection && (
          <div className="mt-8">
            <h3 className="font-medium text-gray-800 mb-3">{docSection[0]}</h3>
            {Object.entries(docSection[1]).map(([label, value]) => (
              <div key={label} className="mb-2">
                {typeof value === 'object' && value !== null ? value : <span className="text-sm font-medium">{value}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentIdFromUrl = searchParams.get('appointmentId');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showLoader, hideLoader } = useLoader();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(() => {
    if (!appointmentIdFromUrl) return true;
    return !queryClient.getQueryData(queryKeys.visitConsolidated(appointmentIdFromUrl));
  });
  const [error, setError] = useState(null);

  // Add saving-related states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Add appointment-related states
  const [appointments, setAppointments] = useState([]);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(appointmentIdFromUrl);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAllAppointments, setShowAllAppointments] = useState(!appointmentIdFromUrl);

  // Patient state
  const [patientData, setPatientData] = useState({
    id: "",
    name: "",
    age: 0,
    gender: "",
    email: "",
    phone: "",
    birthDate: "",
    disease: "",
    avatar: null,
    isInternationalPatient: false,
    notes: "",
    bloodPressure: null,
    temperature: null,
    weight: null,
    height: null,
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    pulse: null,
    oxygenSaturation: null,
    govtId: ""
  });

  // Consultation state (now tied to appointment)
  const [consultationData, setConsultationData] = useState({
    consultationType: "Konsultacja w przychodni",
    consultationDoctor: "",
    time: "",
    consultationDate: "",
    notes: "",
    treatmentCategory: "",
    isOnline: false,
    interview: "",
    physicalExamination: "",
    treatment: "",
    recommendations: ""
  });

  // const navigate=useNavigate();

  // States for medications, tests, and files (now tied to appointment)
  const [medications, setMedications] = useState([]);
  const [tests, setTests] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Stan usług
  const [patientServices, setPatientServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  // Stan powiadomień
  const [notifyPatient, setNotifyPatient] = useState(false);

  // Stany modali
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  // State for delete confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false);

  // Add reports state
  const [reports, setReports] = useState([]);
  const [showReportUploader, setShowReportUploader] = useState(false);

  // Add new states for PatientDetailsModal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedPatientData, setDetailedPatientData] = useState(null);

  // Add states for Visit Card Confirmation Modal
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [pendingVisitCardData, setPendingVisitCardData] = useState(null);

  // Diagnoses (ICD-10) and procedures (ICD-9) – from visit APIs
  const [diagnoses, setDiagnoses] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Visit reason verification (API2 + API1)
  const [visitReasonVerified, setVisitReasonVerified] = useState(null); // boolean | null (unknown)
  const [visitReasonVerifyLoading, setVisitReasonVerifyLoading] = useState(false);

  // Visit documentation template pickers (section = one field, global = full visit)
  const [sectionTemplatePickerKey, setSectionTemplatePickerKey] = useState(null);
  const [globalTemplatePickerOpen, setGlobalTemplatePickerOpen] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const settlementNavigationBlocker = useBlocker(showSettlementModal);

  useEffect(() => {
    if (settlementNavigationBlocker.state !== "blocked") return;
    const leave = window.confirm(
      "Wizyta nie została rozliczona. Aby ją zakończyć, wybierz usługę i utwórz rozliczenie."
    );
    if (leave) settlementNavigationBlocker.proceed();
    else settlementNavigationBlocker.reset();
  }, [settlementNavigationBlocker]);

  useEffect(() => {
    if (!showSettlementModal) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [showSettlementModal]);

  const resolveVisitDoctorUserId = (appointment) => {
    if (!appointment) return null;
    const doc = appointment.doctor ?? appointment.doctorId;
    if (!doc) return null;
    if (typeof doc === "string" || typeof doc === "number") return String(doc);
    return (
      doc._id ||
      doc.id ||
      doc.d_id ||
      doc.userId ||
      doc.user_id ||
      null
    );
  };

  const visitBelongsToLoggedInDoctor = (appointment) => {
    if (user?.role !== "doctor") return true;
    const visitDoctorUserId = resolveVisitDoctorUserId(appointment);
    if (!visitDoctorUserId) return false;
    const mine = [user.id, user._id, user.d_id].filter(Boolean).map(String);
    return mine.includes(String(visitDoctorUserId));
  };

  const filterVisitHistoryForRole = (list) => {
    const rows = Array.isArray(list) ? list : [];
    if (user?.role !== "doctor") return rows;
    return rows.filter((apt) => visitBelongsToLoggedInDoctor(apt));
  };

  const SECTION_LABELS = {
    interview: "Wywiad z pacjentem",
    physicalExamination: "Badanie przedmiotowe",
    treatment: "Zastosowane leczenie",
    recommendations: "Zalecenia",
    notes: "Notatki"
  };

  // Auto-save functionality for patient details (direct save)
  const directSaveFunction = async (dataToSave, meta) => {
    if (!currentAppointmentId) return;
    
    const hasUploadingFiles = uploadedFiles.some(
      (file) => file.progress < 100
    );

    if (hasUploadingFiles) {
      // Skip auto-save if files are still uploading
      return;
    }

    const cd = dataToSave.consultationData || consultationData;
    await appointmentHelper.updateAppointmentDetails(
      currentAppointmentId,
      {
        patientData: dataToSave.patientData || patientData,
        consultationData: mergeConsultationVerificationFlags(cd, visitReasonVerified),
        medications: dataToSave.medications || medications,
        tests: dataToSave.tests || tests,
        uploadedFiles: dataToSave.uploadedFiles || uploadedFiles,
        notes: cd.notes
      }
    );
  };

  // Setup auto-save hook
  const { manualSave: manualSaveDraft } = useAutoSave({
    formType: 'patient_details',
    formData: {
      patientData,
      consultationData,
      medications,
      tests,
      uploadedFiles
    },
    metadata: {
      appointmentId: currentAppointmentId,
      patientId: id
    },
    debounceMs: 3000, // 3 seconds debounce
    autoSaveInterval: 30000, // Auto-save every 30 seconds
    enabled: !!currentAppointmentId, // Only enable if appointment is selected
    directSave: true,
    directSaveFunction: directSaveFunction,
    onSaveSuccess: () => {
      setLastSavedTime(
        new Date().toLocaleTimeString("pl-PL", {
          timeZone: "Europe/Warsaw",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        })
      );
    },
    onSaveError: (error) => {
      // Silent error - data is saved to localStorage as fallback
      console.log('Auto-save failed, saved to localStorage:', error);
    }
  });

  // Visit reason verification comes from consolidated payload / verify action.
  // Keep a lightweight refresh only when we somehow still have unknown status.
  useEffect(() => {
    if (!currentAppointmentId) return;
    if (visitReasonVerified !== null) return;

    let cancelled = false;
    setVisitReasonVerifyLoading(true);
    appointmentHelper
      .getVisitReasonVerifyStatus(currentAppointmentId)
      .then((res) => {
        if (cancelled) return;
        const v = res?.visitReasonVerified;
        if (typeof v === "boolean") setVisitReasonVerified(v);
        else setVisitReasonVerified(false);
      })
      .catch(() => {
        if (!cancelled) setVisitReasonVerified(false);
      })
      .finally(() => {
        if (!cancelled) setVisitReasonVerifyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentAppointmentId, visitReasonVerified]);

  const mapConsolidatedServices = (services = []) =>
    (Array.isArray(services) ? services : []).map((serviceItem, index) => ({
      serviceId: serviceItem.serviceId || serviceItem.service?._id || `svc-${index}`,
      _id: serviceItem._id || serviceItem.serviceId || `svc-${index}`,
      title: serviceItem.title || serviceItem.service?.title || "Usługa",
      price: serviceItem.price ?? serviceItem.service?.price ?? 0,
      quantity: serviceItem.quantity || 1,
      totalPrice: (
        parseFloat(serviceItem.price ?? serviceItem.service?.price ?? 0) *
        (serviceItem.quantity || 1)
      ).toFixed(2),
      status: serviceItem.status || "active",
      notes: serviceItem.notes || "",
    }));

  const applyConsolidatedPayload = (payload, appointmentId) => {
    if (!payload) return;

    const {
      patient,
      appointment,
      consultation,
      appointmentHistory,
      diagnoses: diagnosesList,
      procedures: proceduresList,
      services,
      medications: appointmentMedications,
      tests: appointmentTests,
      reports: appointmentReports,
    } = payload;

    if (patient) {
      setPatientData((prevData) => ({
        ...prevData,
        ...patient,
        patientId: patient.patientId ?? patient.patient_id ?? prevData.patientId,
        patient_id: patient.patient_id ?? patient._id ?? prevData.patient_id,
        bloodPressure: patient.bloodPressure ?? prevData.bloodPressure ?? null,
        temperature: patient.temperature ?? prevData.temperature ?? null,
        weight: patient.weight ?? prevData.weight ?? null,
        height: patient.height ?? prevData.height ?? null,
        bloodPressureSystolic: patient.bloodPressureSystolic ?? prevData.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: patient.bloodPressureDiastolic ?? prevData.bloodPressureDiastolic ?? null,
        pulse: patient.pulse ?? prevData.pulse ?? null,
        oxygenSaturation: patient.oxygenSaturation ?? prevData.oxygenSaturation ?? null,
      }));
    }

    const history = filterVisitHistoryForRole(
      Array.isArray(appointmentHistory) ? appointmentHistory : []
    );
    if (history.length > 0) {
      setAppointments(history);
    }

    const selected =
      history.find((apt) => String(apt._id || apt.id) === String(appointmentId)) ||
      (appointment
        ? {
            _id: appointment.id || appointmentId,
            ...appointment,
            doctor: appointment.doctor,
          }
        : null);

    if (selected) {
      if (user?.role === "doctor" && !visitBelongsToLoggedInDoctor(selected)) {
        setError("Brak dostępu do wizyty innego lekarza");
        setSelectedAppointment(null);
        return;
      }
      setSelectedAppointment(selected);
      setCurrentAppointmentId(selected._id || selected.id || appointmentId);
    }

    const appointmentRecord = selected || appointment || {};
    const radiologistVisitFields = isRadiologistAppointment(appointmentRecord)
      ? getRadiologistVisitTypeFields()
      : {};

    setConsultationData((prevConsultation) =>
      normalizeConsultationTypeAliases({
        ...prevConsultation,
        ...(consultation || {}),
        ...radiologistVisitFields,
        notes: consultation?.notes || "",
        date: appointment?.date || prevConsultation.date,
        consultationDate: appointment?.date || prevConsultation.consultationDate,
        time: appointment?.startTime || prevConsultation.time,
        endTime: appointment?.endTime || prevConsultation.endTime,
      })
    );

    if (isRadiologistAppointment(appointmentRecord)) {
      setVisitReasonVerified(true);
    } else if (typeof consultation?.visitReasonVerified === "boolean") {
      setVisitReasonVerified(consultation.visitReasonVerified);
    } else if (typeof consultation?.visitTypeVerified === "boolean") {
      setVisitReasonVerified(consultation.visitTypeVerified);
    }

    setMedications(appointmentMedications || []);
    setTests(appointmentTests || []);
    setReports(appointmentReports || []);
    setDiagnoses(Array.isArray(diagnosesList) ? diagnosesList : []);
    setProcedures(Array.isArray(proceduresList) ? proceduresList : []);
    setPatientServices(mapConsolidatedServices(services));
    setIsServicesLoading(false);
  };

  useLayoutEffect(() => {
    if (!appointmentIdFromUrl) return;
    const cached = unwrapVisitConsolidated(
      queryClient.getQueryData(queryKeys.visitConsolidated(appointmentIdFromUrl))
    );
    if (!cached) return;
    applyConsolidatedPayload(cached, appointmentIdFromUrl);
    setIsLoading(false);
    setVisitReasonVerifyLoading(false);
  }, [appointmentIdFromUrl, queryClient]);

  // Single-request (or 2-request) load for patient details page
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        let targetAppointmentId = appointmentIdFromUrl || null;
        const cachedPayload = targetAppointmentId
          ? unwrapVisitConsolidated(
              queryClient.getQueryData(queryKeys.visitConsolidated(targetAppointmentId))
            )
          : null;

        if (!cachedPayload) {
          setIsLoading(true);
          showLoader();
          setVisitReasonVerifyLoading(true);
        }

        if (!targetAppointmentId) {
          const appointmentsResponse = await appointmentHelper.getPatientAppointments(id);
          const list = filterVisitHistoryForRole(appointmentsResponse.data || []);
          setAppointments(list);
          targetAppointmentId = list[0]?._id || null;
          if (list[0]) setSelectedAppointment(list[0]);
        }

        if (!targetAppointmentId) {
          const patientResponse = await patientService.getPatientDetails(id);
          if (cancelled) return;
          setPatientData((prevData) => ({
            ...prevData,
            ...patientResponse.patientData,
          }));
          setVisitReasonVerified(false);
          return;
        }

        const consolidated = await fetchVisitDetails(queryClient, targetAppointmentId);
        if (cancelled) return;
        applyConsolidatedPayload(unwrapVisitConsolidated(consolidated), targetAppointmentId);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching data:", err);
        setError("błąd serwera");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setVisitReasonVerifyLoading(false);
          hideLoader();
        }
      }
    };

    if (id) {
      fetchData();
    }
    return () => {
      cancelled = true;
    };
  }, [id, appointmentIdFromUrl, queryClient]);

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const cached = unwrapVisitConsolidated(
        queryClient.getQueryData(queryKeys.visitConsolidated(appointmentId))
      );
      if (cached) {
        applyConsolidatedPayload(cached, appointmentId);
      } else {
        showLoader();
      }
      setVisitReasonVerifyLoading(true);
      const response = await fetchVisitDetails(queryClient, appointmentId);
      applyConsolidatedPayload(unwrapVisitConsolidated(response), appointmentId);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      toast.error("Wystąpił błąd");
    } finally {
      setVisitReasonVerifyLoading(false);
      hideLoader();
    }
  };

  // Handle appointment selection
  const handleAppointmentSelect = async (appointmentId) => {
    setCurrentAppointmentId(appointmentId);
    const selected = appointments.find(apt => apt._id === appointmentId);
    setSelectedAppointment(selected);
    await fetchAppointmentDetails(appointmentId);
  };

  const isVisitCompleted = selectedAppointment?.status === "completed" || selectedAppointment?.status === "Completed";

  const toDateStr = (d) => {
    if (!d) return "";
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = new Date(d);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const handleDateChange = async (newDate) => {
    setConsultationData((prev) => ({ ...prev, date: newDate, consultationDate: newDate }));
    if (!currentAppointmentId || isVisitCompleted) return;
    try {
      const startTime = consultationData.time || selectedAppointment?.startTime || "09:00";
      const endTime = consultationData.endTime || selectedAppointment?.endTime || "09:30";
      await appointmentHelper.rescheduleAppointment(currentAppointmentId, {
        newDate,
        newStartTime: startTime,
        newEndTime: endTime
      });
      toast.success("Data wizyty zaktualizowana");
      setSelectedAppointment((prev) => (prev ? { ...prev, date: newDate } : null));
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === currentAppointmentId ? { ...apt, date: newDate } : apt))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Nie udało się zmienić daty wizyty");
    }
  };

  const handleTimeChange = async (newTime) => {
    setConsultationData((prev) => ({ ...prev, time: newTime }));
    if (!currentAppointmentId || isVisitCompleted) return;
    try {
      const dateStr = toDateStr(consultationData.consultationDate || consultationData.date || selectedAppointment?.date);
      const endTime = consultationData.endTime || selectedAppointment?.endTime || newTime;
      await appointmentHelper.rescheduleAppointment(currentAppointmentId, {
        newDate: dateStr,
        newStartTime: newTime,
        newEndTime: endTime
      });
      toast.success("Godzina rozpoczęcia zaktualizowana");
      setSelectedAppointment((prev) => (prev ? { ...prev, startTime: newTime } : null));
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === currentAppointmentId ? { ...apt, startTime: newTime } : apt))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Nie udało się zmienić godziny wizyty");
    }
  };

  const handleEndTimeChange = async (newEndTime) => {
    setConsultationData((prev) => ({ ...prev, endTime: newEndTime }));
    if (!currentAppointmentId || isVisitCompleted) return;
    try {
      const dateStr = toDateStr(consultationData.consultationDate || consultationData.date || selectedAppointment?.date);
      const startTime = consultationData.time || selectedAppointment?.startTime || "09:00";
      await appointmentHelper.rescheduleAppointment(currentAppointmentId, {
        newDate: dateStr,
        newStartTime: startTime,
        newEndTime: newEndTime
      });
      toast.success("Godzina zakończenia zaktualizowana");
      setSelectedAppointment((prev) => (prev ? { ...prev, endTime: newEndTime } : null));
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === currentAppointmentId ? { ...apt, endTime: newEndTime } : apt))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Nie udało się zmienić godziny zakończenia");
    }
  };

  const handleVisitTypeChange = (newVisitReason) => {
    if (!newVisitReason) return;
    // Selecting a new visit reason requires verification again.
    setVisitReasonVerified(false);
    setConsultationData((prev) => ({
      ...prev,
      visitReason: newVisitReason,
      consultationType: newVisitReason,
      // Verification is a separate step (API 1); selecting a type resets it locally.
      visitTypeVerified: false,
    }));
    setSelectedAppointment((prev) =>
      prev ? { ...prev, visitReason: newVisitReason, visitTypeVerified: false } : null
    );
    setAppointments((prev) =>
      prev.map((apt) =>
        apt._id === currentAppointmentId
          ? { ...apt, visitReason: newVisitReason, visitTypeVerified: false }
          : apt
      )
    );

    // Refresh verification status (API 2) so UI reflects backend truth.
    if (currentAppointmentId) {
      setVisitReasonVerifyLoading(true);
      appointmentHelper
        .getVisitReasonVerifyStatus(currentAppointmentId)
        .then((res) => {
          const v = res?.visitReasonVerified;
          setVisitReasonVerified(typeof v === "boolean" ? v : false);
        })
        .catch((err) => {
          console.warn("Failed to refresh visit reason verify status:", err);
          setVisitReasonVerified(false);
        })
        .finally(() => {
          setVisitReasonVerifyLoading(false);
        });
    }
  };

  const canVerifyVisitReason = user?.role === "doctor" || user?.role === "admin";
  const visitDoctorUserId = resolveVisitDoctorUserId(selectedAppointment);

  useEffect(() => {
    if (user?.role === "admin") return;
    const ids = collectDoctorCatalogIds(
      visitDoctorUserId,
      user?.id,
      user?._id,
      user?.d_id
    );
    if (!ids.length) return;
    queryClient.prefetchQuery({
      queryKey: queryKeys.doctorServicesCatalog(ids),
      queryFn: () => loadDoctorAssignedCatalog(ids),
      staleTime: 5 * 60 * 1000,
    });
  }, [
    visitDoctorUserId,
    user?.role,
    user?.id,
    user?._id,
    user?.d_id,
    queryClient,
  ]);

  const handleVerifyVisitReason = async () => {
    if (!currentAppointmentId) return;
    if (!canVerifyVisitReason) return;

    setVisitReasonVerifyLoading(true);
    try {
      await appointmentHelper.verifyVisitReason(currentAppointmentId);
      const res = await appointmentHelper.getVisitReasonVerifyStatus(currentAppointmentId);
      const v = res?.visitReasonVerified;
      const verified = typeof v === "boolean" ? v : true;
      setVisitReasonVerified(verified);
      if (verified) {
        setConsultationData((prev) => ({
          ...prev,
          visitReasonVerified: true,
          visitTypeVerified: true,
        }));
      }
      toast.success("Rodzaj wizyty zweryfikowany");
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === "VISIT_REASON_NOT_SET") {
        toast.error("Najpierw wybierz rodzaj wizyty");
      } else {
        toast.error(err?.response?.data?.message || "Nie udało się zweryfikować rodzaju wizyty");
      }
      setVisitReasonVerified(false);
    } finally {
      setVisitReasonVerifyLoading(false);
    }
  };

  // Fetch patient services
  const fetchPatientServices = async () => {
    try {
      setIsServicesLoading(true);
      //("Fetching services for appointment ID:", currentAppointmentId);
      const response = await patientServicesHelper.getPatientServices(id, { appointmentId: currentAppointmentId });
      
      if (response && response.data && response.data.services) {
        // Map services to format compatible with our UI
        const formattedServices = response.data.services.map(serviceItem => ({
          serviceId: serviceItem.service._id,
          _id: serviceItem._id, // This is the patient service entry ID
          title: serviceItem.service.title,
          price: serviceItem.service.price,
          quantity: serviceItem.quantity || 1,
          totalPrice: (parseFloat(serviceItem.service.price) * (serviceItem.quantity || 1)).toFixed(2),
          status: serviceItem.status,
          notes: serviceItem.notes
        }));
        
        setPatientServices(formattedServices);
      } else {
        setPatientServices([]);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania usług pacjenta:", error);
      toast.error("Nie udało się załadować usług pacjenta.");
    } finally {
      setIsServicesLoading(false);
    }
  };

  const handleSettleAndEndVisit = async (billingData) => {
    if (!currentAppointmentId) return;

    try {
      setIsSaving(true);
      await billingHelper.generateBill(currentAppointmentId, billingData);
      setShowSettlementModal(false);
      setSelectedAppointment((previous) =>
        previous ? { ...previous, status: "completed" } : previous
      );
      setAppointments((previous) =>
        previous.map((appointment) =>
          String(appointment._id || appointment.id) === String(currentAppointmentId)
            ? { ...appointment, status: "completed" }
            : appointment
        )
      );
      toast.success("Rozliczenie utworzone. Wizyta została zakończona.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Nie udało się utworzyć rozliczenia. Wizyta pozostaje otwarta.";
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // End Visit saves clinical data first, then requires settlement before completion.
  const handleSave = async (endVisit = false) => {
    if (!currentAppointmentId) {
      toast.error("Nie wybrano spotkania");
      return;
    }

    try {
      showLoader();
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const hasUploadingFiles = uploadedFiles.some(
        (file) => file.progress < 100
      );

      if (hasUploadingFiles) {
        setSaveError("Proszę poczekać na zakończenie wszystkich plików");
        setIsSaving(false);
        return;
      }

      const response = await appointmentHelper.updateAppointmentDetails(
        currentAppointmentId,
        {
          patientData,
          consultationData: mergeConsultationVerificationFlags(consultationData, visitReasonVerified),
          medications,
          tests,
          uploadedFiles,
          notes: consultationData.notes
        }
      );

      if (response.success) {
        toast.success("Szczegóły spotkania zaktualizowane pomyślnie");
        setSaveSuccess(true);
        setLastSavedTime(
          new Date().toLocaleTimeString("pl-PL", {
            timeZone: "Europe/Warsaw",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          })
        );
        await fetchAppointmentDetails(currentAppointmentId);
        if (endVisit) {
          setShowSettlementModal(true);
        }
      } else {
        throw new Error(response.message || "Nie udało się zaktualizować szczegółów spotkania");
      }
    } catch (error) {
      console.error("Error saving appointment details:", error);
      setSaveError(error?.response?.data?.message || error?.message || "Nie udało się zapisać szczegółów spotkania. Proszę spróbować ponownie.");
      toast.error("Nie udało się zapisać szczegółów spotkania");
    } finally {
      setIsSaving(false);
      hideLoader();
    }
  };

  // Obsługa przesyłania plików
  const handleFileUpload = (files) => {
    //("Przesłane pliki:", files);
    setUploadedFiles((prev) => [...prev, files]);
  };

  // Usuwanie pliku
  const handleRemoveFile = (fileName) => {
    setUploadedFiles((current) =>
      current.filter((file) => file.name !== fileName)
    );
  };

  // Obsługa przycisków akcji
  const handleAddMedicine = (newMedication) => {
    setMedications((prev) => [...prev, newMedication]);
    setShowMedicationForm(false);
  };

  const handleAddTest = (newTest) => {
    setTests((prev) => [...prev, newTest]);
    setShowTestForm(false);
  };

  const handleRemoveMedication = (index) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveTest = (index) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddServices = () => {
    setShowServiceModal(true);
  };

  const handleSaveServices = async (servicesData) => {
    try {
      showLoader();
      
      // Prepare data for API
      const servicesToAdd = servicesData.services.map(service => ({
        serviceId: service.serviceId,
        quantity: service.quantity,
        notes: "",
        status: "active"
      }));
      
      // Call API to add services - include appointmentId
      await patientServicesHelper.addServicesToPatient(id, servicesToAdd, { appointmentId: currentAppointmentId });
      
      // Refresh the services
      await fetchPatientServices();
      
      setShowServiceModal(false);
      hideLoader();
      
      toast.success("Usługi zostały dodane pomyślnie.");
    } catch (error) {
      console.error("Błąd podczas dodawania usług:", error);
      hideLoader();
      toast.error("Nie udało się dodać usług. Spróbuj ponownie.");
    }
  };

  // Initiate service deletion with confirmation
  const initiateServiceDeletion = (serviceId) => {
    setServiceToDelete(serviceId);
    setIsConfirmModalOpen(true);
  };

  // Handle removing a service after confirmation
  const handleRemoveService = async () => {
    if (!serviceToDelete) return;
    
    try {
      showLoader();
      await patientServicesHelper.removeServiceFromPatient(id, serviceToDelete, { appointmentId: currentAppointmentId });
      
      // Update state after successful removal
      setPatientServices(patientServices.filter(service => service.serviceId !== serviceToDelete));
      toast.success("Usługa została usunięta.");
      hideLoader();
    } catch (error) {
      console.error("Błąd podczas usuwania usługi:", error);
      hideLoader();
      toast.error("Nie udało się usunąć usługi. Spróbuj ponownie.");
    } finally {
      setServiceToDelete(null);
    }
  };

  // Initiate removing all services with confirmation
  const initiateRemoveAllServices = () => {
    setIsConfirmAllModalOpen(true);
  };

  // Handle removing all services after confirmation
  const handleRemoveAllServices = async () => {
    try {
      showLoader();
      await patientServicesHelper.deleteAllPatientServices(id, { appointmentId: currentAppointmentId });
      setPatientServices([]);
      toast.success("Wszystkie usługi zostały usunięte.");
      hideLoader();
    } catch (error) {
      console.error("Błąd podczas usuwania wszystkich usług:", error);
      hideLoader();
      toast.error("Nie udało się usunąć wszystkich usług. Spróbuj ponownie.");
    }
  };

  // Handle report upload success – refetch so reports list updates
  const handleReportUploadSuccess = () => {
    if (currentAppointmentId) fetchAppointmentDetails(currentAppointmentId);
  };

  // Handle report deletion
  const handleReportDeleted = (remainingReports) => {
    window.location.reload();
    setReports(remainingReports);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Usługi – collapsible section, cards with name, price, x
  const PatientServicesSection = () => {
    const [collapsed, setCollapsed] = useState(false);

    if (isServicesLoading) {
      return (
        <div className="bg-white rounded border border-gray-200 p-5 w-full">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Usługi</h3>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded border border-gray-200 overflow-hidden w-full">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <h3 className="text-base font-semibold text-gray-800">Usługi</h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-600 transition-transform ${collapsed ? "" : "rotate-180"}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {!collapsed && (
          <div className="px-5 pb-5 space-y-3">
            {(!patientServices || patientServices.length === 0) ? (
              <p className="text-sm text-gray-500 py-4">Brak przypisanych usług.</p>
            ) : (
              patientServices.map((service) => (
                <div
                  key={service._id}
                  className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-800">{service.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{Number(service.totalPrice || service.price || 0).toFixed(2).replace(".", ",")} zł</span>
                    <button
                      type="button"
                      onClick={() => initiateServiceDeletion(service.serviceId)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
            <button
              type="button"
              onClick={handleAddServices}
              className="flex items-center gap-1 text-teal-700 hover:text-teal-800 text-sm font-medium"
            >
              <PlusCircle size={18} />
              Dodaj usługę
            </button>
          </div>
        )}
      </div>
    );
  };

  // Add function to fetch detailed patient data
  const handleShowDetails = async () => {
    try {
      showLoader();
      const response = await patientService.getPatientById(id, {
        include: "documents,consents",
      });
      //(response, "response deails");
      setDetailedPatientData(response);
      setShowDetailsModal(true);
      hideLoader();
    } catch (error) {
      console.error("Error fetching detailed patient data:", error);
      toast.error("Nie udało się pobrać szczegółowych danych pacjenta");
      hideLoader();
    }
  };

  // Add AppointmentDetails component
  const AppointmentDetails = ({ appointment }) => {
    if (!appointment) return null;

    // Helper function to render boolean field with icon
    const renderBooleanField = (value, label, icon, trueColor = "text-green-600", falseColor = "text-gray-400") => {
      return (
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-gray-600">{label}:</span>
          <span className={`text-sm font-medium ${value ? trueColor : falseColor}`}>
            {value ? "Tak" : "Nie"}
          </span>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-lg font-semibold mb-4">Szczegóły wizyty</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-teal-500" />
              <span className="text-sm text-gray-600">Data:</span>
              <span className="text-sm font-medium">
                {new Date(appointment.date).toLocaleDateString('pl-PL')}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-teal-500" />
              <span className="text-sm text-gray-600">Godzina:</span>
              <span className="text-sm font-medium">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-teal-500" />
              <span className="text-sm text-gray-600">Lekarz:</span>
              <span className="text-sm font-medium">
                {stripDoctorTitle([appointment.doctor?.name?.first, appointment.doctor?.name?.last].filter(Boolean).join(" ") || (typeof appointment.doctor?.name === "string" ? appointment.doctor.name : "")) || "—"}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Video size={16} className="text-teal-500" />
              <span className="text-sm text-gray-600">Tryb wizyty:</span>
              <span className="text-sm font-medium">
                {appointment.mode === "online" ? "Wizyta online" : "Wizyta w przychodni"}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-teal-500" />
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                appointment.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : appointment.status === "scheduled"
                  ? "bg-blue-100 text-blue-800"
                  : appointment.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {translateStatus(appointment.status)}
              </span>
            </div>
            {appointment && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <FileText size={16} className="text-teal-500" />
                <span className="text-sm text-gray-600">Rodzaj wizyty:</span>
                <span className="text-sm font-medium">
                  {getVisitTypeDisplayLabel(appointment)}
                </span>
                {visitReasonVerified === false &&
                  !isRadiologistAppointment(appointment) &&
                  appointment.status !== "completed" &&
                  appointment.status !== "Completed" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Do weryfikacji</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Appointment Flags Section - using patient data */}
        {(patientData.isWalkin || patientData.needsAttention || patientData.isBackdated || patientData.overrideConflicts || patientData.isEmergency) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-800 mb-3">Dodatkowe Informacje o Wizycie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {renderBooleanField(
                  patientData.isWalkin,
                  "Pacjent bez wcześniejszej rezerwacji",
                  <User size={16} className="text-blue-500" />
                )}
                {renderBooleanField(
                  patientData.needsAttention,
                  "Wymaga szczególnej uwagi",
                  <Info size={16} className="text-yellow-500" />
                )}
                {renderBooleanField(
                  patientData.isEmergency,
                  "Wizyta nagła (priorytetowa)",
                  <Activity size={16} className="text-red-500" />
                )}
              </div>
              <div>
                {renderBooleanField(
                  patientData.isBackdated,
                  "Pozwolono na daty z przeszłości",
                  <Clock size={16} className="text-orange-500" />
                )}
                {renderBooleanField(
                  patientData.overrideConflicts,
                  "Nadpisano konflikty czasowe",
                  <FileText size={16} className="text-purple-500" />
                )}
              </div>
            </div>
            
            {/* Receptionist Notes */}
            {patientData.receptionistNotes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Notatki Recepcjonisty:</h5>
                <p className="text-sm text-gray-600">{patientData.receptionistNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleGenerateVisitCard = async (appointmentId, e, forceNew = false) => {
    e?.stopPropagation?.(); // Prevent appointment selection when clicking the button

    // Block generating visit card until visit reason is verified (API 1/2).
    if (
      !isRadiologistAppointment(selectedAppointment) &&
      (visitReasonVerifyLoading || visitReasonVerified === false)
    ) {
      toast.warning("Najpierw zweryfikuj rodzaj wizyty, aby pobrać kartę.");
      return;
    }
    try {
      showLoader();
      const response = await appointmentHelper.generateVisitCard(appointmentId, forceNew);
      
      if (response.success && response.data.url) {
        // Refresh visit reports so the card appears in documentation without a full page reload
        if (typeof fetchAppointmentDetails === "function") {
          await fetchAppointmentDetails(appointmentId);
        } else if (response.data.report) {
          setReports((prev) => {
            const next = Array.isArray(prev) ? [...prev] : [];
            const exists = next.some(
              (r) =>
                String(r._id) === String(response.data.reportId) ||
                (r.type === "visit-card" && (r.fileUrl || r.url) === response.data.url)
            );
            if (!exists) next.unshift(response.data.report);
            return next;
          });
        }

        // Check if visit card already exists
        if (response.message === "Karta wizyty już istnieje" && !forceNew) {
          // Store the data for the modal
          setPendingVisitCardData({
            appointmentId,
            url: response.data.url,
            event: e
          });
          setShowVisitCardModal(true);
        } else {
          // Normal case - open the visit card
          window.open(response.data.url, '_blank');
          toast.success("Karta wizyty wygenerowana i dodana do dokumentacji wizyty");
        }
      } else {
        toast.error("Nie udało się wygenerować karty wizyty");
      }
    } catch (error) {
      console.error("Error generating visit card:", error);
      toast.error("Wystąpił błąd podczas generowania karty wizyty");
    } finally {
      hideLoader();
    }
  };

  // Handle viewing existing visit card
  const handleViewExistingCard = () => {
    if (pendingVisitCardData?.url) {
      window.open(pendingVisitCardData.url, '_blank');
    }
    setPendingVisitCardData(null);
  };

  // Handle generating new visit card
  const handleGenerateNewCard = async () => {
    if (pendingVisitCardData) {
      await handleGenerateVisitCard(pendingVisitCardData.appointmentId, pendingVisitCardData.event, true);
    }
    setPendingVisitCardData(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Visit info header */}
      {selectedAppointment && (
        <VisitInfoHeader
          appointment={selectedAppointment}
          consultationData={consultationData}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          onEndTimeChange={handleEndTimeChange}
          onVisitTypeChange={handleVisitTypeChange}
          readOnly={isVisitCompleted}
          visitReasonVerified={visitReasonVerified}
          visitReasonVerifyLoading={visitReasonVerifyLoading}
          canVerifyVisitReason={canVerifyVisitReason}
          onVerifyVisitReason={handleVerifyVisitReason}
        />
      )}

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            <PatientHeaderCard
              patient={{
                ...patientData,
                gender: patientData.gender === "Male" ? "Mężczyzna" : patientData.gender === "Female" ? "Kobieta" : patientData.sex,
                patientId: patientData.patientId ?? patientData.patient_id,
              }}
              onShowMoreDetails={handleShowDetails}
            />
            <LifeParamsCard
              patient={patientData}
              onLifeParamsChange={(updates) =>
                setPatientData((prev) => ({ ...prev, ...updates }))
              }
            />
            <VisitHistoryCard
              appointments={appointments}
              currentAppointmentId={currentAppointmentId}
              onSelectVisit={handleAppointmentSelect}
            />
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {selectedAppointment && (
              <>
                <DiagnosisCard
                  diagnoses={diagnoses}
                  onSearchIcd10={(q) => appointmentHelper.searchIcd10(q)}
                  onAddDiagnosis={async (item) => {
                    if (!currentAppointmentId) return;
                    try {
                      const res = await appointmentHelper.addVisitDiagnosis(currentAppointmentId, item);
                      const created = res?.data || res;
                      if (created?.id || created?._id) {
                        setDiagnoses((prev) => {
                          const next = Array.isArray(prev) ? [...prev] : [];
                          if (created.isPrimary) {
                            return [
                              { ...created, id: created.id || created._id },
                              ...next.map((d) => ({ ...d, isPrimary: false })),
                            ];
                          }
                          return [...next, { ...created, id: created.id || created._id }];
                        });
                      }
                      toast.success("Dodano rozpoznanie");
                    } catch (e) {
                      toast.error(e.response?.data?.message || "Nie udało się dodać rozpoznania");
                    }
                  }}
                  onRemoveDiagnosis={async (id) => {
                    if (!currentAppointmentId) return;
                    try {
                      await appointmentHelper.removeVisitDiagnosis(currentAppointmentId, id);
                      setDiagnoses((prev) =>
                        (prev || []).filter((d) => String(d.id || d._id) !== String(id))
                      );
                      toast.success("Usunięto rozpoznanie");
                    } catch (e) {
                      toast.error(e.response?.data?.message || "Nie udało się usunąć rozpoznania");
                    }
                  }}
                  onTogglePrimary={async (diagnosisId, isPrimary) => {
                    if (!currentAppointmentId) return;
                    try {
                      await appointmentHelper.updateVisitDiagnosis(currentAppointmentId, diagnosisId, { isPrimary });
                      setDiagnoses((prev) =>
                        (prev || []).map((d) => ({
                          ...d,
                          isPrimary:
                            String(d.id || d._id) === String(diagnosisId) ? !!isPrimary : isPrimary ? false : d.isPrimary,
                        }))
                      );
                      toast.success(isPrimary ? "Ustawiono jako główne rozpoznanie" : "Ustawiono jako rozpoznanie dodatkowe");
                    } catch (e) {
                      toast.error(e.response?.data?.message || "Nie udało się zmienić typu rozpoznania");
                    }
                  }}
                />
                <ProceduresCard
                  procedures={procedures}
                  onSearchIcd9={(q) => appointmentHelper.searchIcd9(q)}
                  onAddProcedure={async (item) => {
                    if (!currentAppointmentId) return;
                    try {
                      const res = await appointmentHelper.addVisitProcedure(currentAppointmentId, item);
                      const created = res?.data || res;
                      if (created?.id || created?._id) {
                        setProcedures((prev) => [
                          ...(Array.isArray(prev) ? prev : []),
                          { ...created, id: created.id || created._id },
                        ]);
                      }
                      toast.success("Dodano procedurę");
                    } catch (e) {
                      toast.error(e.response?.data?.message || "Nie udało się dodać procedury");
                    }
                  }}
                  onRemoveProcedure={async (id) => {
                    if (!currentAppointmentId) return;
                    try {
                      await appointmentHelper.removeVisitProcedure(currentAppointmentId, id);
                      setProcedures((prev) =>
                        (prev || []).filter((p) => String(p.id || p._id) !== String(id))
                      );
                      toast.success("Usunięto procedurę");
                    } catch (e) {
                      toast.error(e.response?.data?.message || "Nie udało się usunąć procedury");
                    }
                  }}
                />
                {/* Załaduj szablon globalny – fills all documentation sections at once */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setGlobalTemplatePickerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border-2 border-blue-500 rounded-lg hover:bg-blue-200 hover:border-blue-600 transition-colors shadow-sm"
                  >
                    <FileText size={18} />
                    Załaduj szablon globalny
                  </button>
                </div>
                <SectionTemplatePickerModal
                  isOpen={!!sectionTemplatePickerKey}
                  onClose={() => setSectionTemplatePickerKey(null)}
                  sectionKey={sectionTemplatePickerKey}
                  sectionLabel={sectionTemplatePickerKey ? SECTION_LABELS[sectionTemplatePickerKey] : null}
                  onSelect={(content) => {
                    if (sectionTemplatePickerKey) {
                      setConsultationData((prev) => ({ ...prev, [sectionTemplatePickerKey]: content ?? "" }));
                      setSectionTemplatePickerKey(null);
                    }
                  }}
                />
                <GlobalTemplatePickerModal
                  isOpen={globalTemplatePickerOpen}
                  onClose={() => setGlobalTemplatePickerOpen(false)}
                  onSelect={(sections) => {
                    setConsultationData((prev) => ({
                      ...prev,
                      interview: sections.interview ?? prev.interview,
                      physicalExamination: sections.physicalExamination ?? prev.physicalExamination,
                      treatment: sections.treatment ?? prev.treatment,
                      recommendations: sections.recommendations ?? prev.recommendations,
                      notes: sections.notes ?? prev.notes
                    }));
                    setGlobalTemplatePickerOpen(false);
                  }}
                />
                <DocumentationCard
                  title="Wywiad z pacjentem"
                  value={consultationData.interview}
                  onChange={(v) => setConsultationData((prev) => ({ ...prev, interview: v }))}
                  placeholder="Dokumentacja wywiadu z pacjentem..."
                  onChooseTemplate={() => setSectionTemplatePickerKey("interview")}
                />
                <DocumentationCard
                  title="Badanie przedmiotowe"
                  value={consultationData.physicalExamination}
                  onChange={(v) => setConsultationData((prev) => ({ ...prev, physicalExamination: v }))}
                  placeholder="Opis badania przedmiotowego..."
                  onChooseTemplate={() => setSectionTemplatePickerKey("physicalExamination")}
                />
                <DocumentationCard
                  title="Zastosowane leczenie"
                  value={consultationData.treatment}
                  onChange={(v) => setConsultationData((prev) => ({ ...prev, treatment: v }))}
                  placeholder="Opis zastosowanego leczenia..."
                  onChooseTemplate={() => setSectionTemplatePickerKey("treatment")}
                />
                <DocumentationCard
                  title="Zalecenia"
                  value={consultationData.recommendations}
                  onChange={(v) => setConsultationData((prev) => ({ ...prev, recommendations: v }))}
                  placeholder="Zalecenia dla pacjenta..."
                  onChooseTemplate={() => setSectionTemplatePickerKey("recommendations")}
                />

                <NotesCard
                  value={consultationData.notes}
                  onChange={(v) => setConsultationData((prev) => ({ ...prev, notes: v }))}
                  onChooseTemplate={() => setSectionTemplatePickerKey("notes")}
                />

                <MedicalDocumentsCard
                  appointmentId={currentAppointmentId}
                  onSuccess={handleReportUploadSuccess}
                />
                <ReportsList
                  appointmentId={currentAppointmentId}
                  reports={reports}
                  onReportDeleted={handleReportDeleted}
                />

                <PatientServicesSection />
                <MedicationsSection
                  medications={medications}
                  setMedications={setMedications}
                  showForm={showMedicationForm}
                  setShowForm={setShowMedicationForm}
                  onAddMedication={handleAddMedicine}
                  onRemoveMedication={handleRemoveMedication}
                />
                <TestsSection
                  tests={tests}
                  setTests={setTests}
                  showForm={showTestForm}
                  setShowForm={setShowTestForm}
                  onAddTest={handleAddTest}
                  onRemoveTest={handleRemoveTest}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {selectedAppointment && (
        <PatientDetailsFooter
          onDownloadVisitCard={() => handleGenerateVisitCard(currentAppointmentId, { stopPropagation: () => {} })}
          onSaveVisit={() => handleSave(false)}
          lastSavedTime={lastSavedTime}
          onEndVisit={() => handleSave(true)}
          isSaving={isSaving}
          isVisitReasonVerified={visitReasonVerified}
          isVisitReasonVerifyLoading={visitReasonVerifyLoading}
        />
      )}

      <BillingConfirmationModal
        isOpen={showSettlementModal}
        onClose={() => {}}
        onConfirm={handleSettleAndEndVisit}
        patientServicesData={patientServices}
        patientName={formatPersonName(patientData?.name)}
        appointmentId={currentAppointmentId}
        patientId={id}
        mandatory
        doctorUserId={resolveVisitDoctorUserId(selectedAppointment) || user?._id || user?.id}
      />

      {/* Existing modals */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSave={handleSaveServices}
        patientId={id}
        doctorUserId={
          user?.role === "admin"
            ? null
            : visitDoctorUserId || user?.id || user?._id || user?.d_id || null
        }
      />
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRemoveService}
        title="Confirm Service Removal"
        message="Are you sure you want to remove this service?"
      />
      
      <ConfirmationModal
        isOpen={isConfirmAllModalOpen}
        onClose={() => setIsConfirmAllModalOpen(false)}
        onConfirm={handleRemoveAllServices}
        title="Confirm Remove All Services"
        message="Are you sure you want to remove all services?"
      />

      {/* Add PatientDetailsModal */}
      <PatientDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        patientData={detailedPatientData}
      />

      {/* Add Visit Card Confirmation Modal */}
      <VisitCardConfirmationModal
        isOpen={showVisitCardModal}
        onClose={() => {
          setShowVisitCardModal(false);
          setPendingVisitCardData(null);
        }}
        onViewExisting={handleViewExistingCard}
        onGenerateNew={handleGenerateNewCard}
        existingUrl={pendingVisitCardData?.url}
      />
    </div>
  );
};

export default PatientDetailsPage;
