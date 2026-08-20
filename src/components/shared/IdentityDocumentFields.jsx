import { IDENTITY_DOCUMENT_TYPES, isIdentityDocumentExpired, todayYmd } from "../../utils/identityDocument";
import KioskDateInput from "../Kiosk/KioskDateInput";

const SIZE_CLASSES = {
  lg: {
    label: "block text-sm font-medium text-gray-700 mb-2",
    input: "w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white",
  },
  md: {
    label: "block text-sm font-medium text-gray-700 mb-1",
    input: "w-full px-3 py-2 border border-gray-300 rounded-md bg-white",
  },
  sm: {
    label: "block text-xs font-medium text-gray-600 mb-1",
    input: "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white",
  },
};

export default function IdentityDocumentFields({
  values = {},
  onChange,
  readOnly = false,
  size = "lg",
  className = "",
}) {
  const classes = SIZE_CLASSES[size] || SIZE_CLASSES.lg;
  const documentType = values.documentType || "";
  const documentNumber = values.documentNumber || "";
  const documentCountry = values.documentCountry || "";
  const documentIssueDate = values.documentIssueDate || "";
  const documentExpiryDate = values.documentExpiryDate || "";

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className={classes.label}>Typ dokumentu *</label>
        <select
          value={documentType}
          onChange={(e) => onChange?.("documentType", e.target.value)}
          disabled={readOnly}
          className={classes.input}
          required
        >
          {IDENTITY_DOCUMENT_TYPES.map((doc) => (
            <option key={doc.value || "empty"} value={doc.value}>
              {doc.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={classes.label}>Numer dokumentu *</label>
        <input
          type="text"
          value={documentNumber}
          onChange={(e) =>
            onChange?.("documentNumber", e.target.value.toUpperCase())
          }
          readOnly={readOnly}
          className={`${classes.input} font-mono`}
          placeholder="np. AB123456"
          required
        />
      </div>

      <div>
        <label className={classes.label}>Kraj wydania dokumentu *</label>
        <input
          type="text"
          value={documentCountry}
          onChange={(e) => onChange?.("documentCountry", e.target.value)}
          readOnly={readOnly}
          className={classes.input}
          placeholder="np. Niemcy, Francja, USA"
          required
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="min-w-0">
          <label className={classes.label}>Data wydania dokumentu *</label>
          <KioskDateInput
            value={documentIssueDate}
            onChange={(e) => onChange?.("documentIssueDate", e.target.value)}
            readOnly={readOnly}
            required
            max={todayYmd()}
          />
        </div>
        <div className="min-w-0">
          <label className={classes.label}>Data wygaśnięcia dokumentu *</label>
          <KioskDateInput
            value={documentExpiryDate}
            onChange={(e) => onChange?.("documentExpiryDate", e.target.value)}
            readOnly={readOnly}
            required
            className={isIdentityDocumentExpired(documentExpiryDate) ? "border-red-500" : ""}
          />
          {isIdentityDocumentExpired(documentExpiryDate) && (
            <p className="text-red-600 text-xs mt-1">
              Dokument jest już wygasły. Nie można kontynuować rejestracji.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
