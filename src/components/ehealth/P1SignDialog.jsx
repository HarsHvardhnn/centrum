import React, { useEffect, useState } from "react";
import CertificateModal from "./CertificateModal";
import { clearSigning, provideSigning, signingRequired } from "./ehealthSigning";

/**
 * Confirmation before issuing or cancelling a P1 document.
 * A doctor selects the certificate from the flash drive and types the PIN every time; the file and
 * PIN travel with the request that follows and are never stored. Admin and reception users get a
 * plain confirmation. Pass `noCertificate` where the certificate was already loaded (e-ZLA session).
 */
const P1SignDialog = ({
  open,
  isOpen,
  onClose,
  onConfirm,
  title = "Autoryzacja wysyłki do P1",
  actionText = "Podpisz i wyślij",
  isDestructive = false,
  doctorLine,
  noCertificate = false,
  children,
}) => {
  const shown = open ?? isOpen;
  const [required, setRequired] = useState(null);

  useEffect(() => {
    if (!shown) return undefined;
    let cancelled = false;
    signingRequired().then((value) => !cancelled && setRequired(value));
    return () => {
      cancelled = true;
    };
  }, [shown]);

  if (!shown || required === null) return null;

  return (
    <CertificateModal
      open
      title={title}
      actionText={actionText}
      isDestructive={isDestructive}
      doctorLine={doctorLine}
      needsCertificate={required && !noCertificate}
      verify
      plainText={isDestructive ? "Potwierdź anulowanie dokumentu w P1." : "Potwierdź wystawienie. Dokument zostanie wysłany do P1."}
      onCancel={onClose}
      onSubmit={async (signing) => {
        if (signing) provideSigning(signing);
        try {
          await onConfirm?.();
        } finally {
          clearSigning();
        }
      }}
    >
      {children}
    </CertificateModal>
  );
};

export default P1SignDialog;
