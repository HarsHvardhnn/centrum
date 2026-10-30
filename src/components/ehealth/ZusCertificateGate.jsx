import React from "react";
import CertificateModal from "./CertificateModal";
import { startZusSession } from "./ehealthSigning";

/** First step of an e-ZLA: the doctor loads the ZUS certificate from the flash drive.
 *  It is handed to the server only for this session and removed when the window closes. */
const ZusCertificateGate = ({ onReady, onClose, doctorLine }) => (
  <CertificateModal
    open
    title="Certyfikat ZUS do e-ZLA"
    actionText="Wczytaj certyfikat"
    doctorLine={doctorLine}
    needsCertificate
    verify={false}
    busyText="Sprawdzam certyfikat i łączę z ZUS…"
    onCancel={onClose}
    onSubmit={async (signing) => {
      await startZusSession(signing);
      onReady();
    }}
  >
    <p className="text-sm text-slate-600">
      Aby wystawić zwolnienie, podłącz pendrive z certyfikatem ZUS, wybierz plik i wpisz PIN. Certyfikat jest używany tylko do tego
      zwolnienia i zostaje usunięty po zamknięciu okna.
    </p>
  </CertificateModal>
);

export default ZusCertificateGate;
