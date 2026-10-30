import React, { useEffect, useState } from "react";
import CertificateModal from "./CertificateModal";
import { registerSigningHost } from "./ehealthSigning";

/** Mounted once. Opens the certificate window for requests that have no dialog of their own
 *  (for example cancelling a document from the history list). */
const SigningPromptHost = () => {
  const [request, setRequest] = useState(null);

  useEffect(() => registerSigningHost((next) => setRequest(next)), []);

  if (!request) return null;
  const { options, resolve, reject } = request;
  const close = () => setRequest(null);

  return (
    <CertificateModal
      open
      title={options.title || "Podpis certyfikatem"}
      actionText={options.actionText || "Podpisz"}
      isDestructive={Boolean(options.isDestructive)}
      needsCertificate
      verify
      busyText="Sprawdzam certyfikat…"
      onCancel={() => {
        reject(new Error("Anulowano podpis."));
        close();
      }}
      onSubmit={async (signing) => {
        resolve(signing);
        close();
      }}
    />
  );
};

export default SigningPromptHost;
