import React, { useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";

const ReferralRealizationCard = () => {
  const [code, setCode] = useState("");
  const [pesel, setPesel] = useState("");
  const [key, setKey] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState(null);

  const readout = async () => {
    try {
      setBusy(true);
      const res = await ehealthHelper.referralReadout({ code, pesel, key });
      if (!res?.success) throw new Error(res?.error?.message || "Odczyt nieudany");
      setDoc(res.data);
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (action) => {
    const referralKey = key || doc?.body?.kluczSkierowania || doc?.kluczSkierowania || "";
    try {
      setBusy(true);
      const res = await ehealthHelper.referralRealize({
        action,
        key: referralKey,
        referralId: doc?.body?.idSkierowania || doc?.idSkierowania || "",
        comment,
        reimbursed: "N",
      });
      if (!res?.success) throw new Error(res?.error?.message || "Operacja nieudana");
      toast.success("Zapisano realizację skierowania");
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
      <div className="text-xs font-medium text-gray-500">Realizacja skierowania</div>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Kod 4 cyfry" className="w-full p-2 border rounded text-sm" />
      <input value={pesel} onChange={(e) => setPesel(e.target.value)} placeholder="PESEL pacjenta" className="w-full p-2 border rounded text-sm" />
      <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="albo klucz skierowania" className="w-full p-2 border rounded text-sm" />
      <button type="button" disabled={busy} onClick={readout} className="w-full px-3 py-2 border border-teal-700 text-teal-800 rounded text-sm">
        Odczytaj
      </button>
      {doc && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Skierowanie odczytane. Przyjęcie i odmowa działają po włączeniu wysyłki na żywo.</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Komentarz" className="w-full p-2 border rounded text-sm" />
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => act("accept")} className="flex-1 px-2 py-1.5 bg-teal-700 text-white rounded text-xs">Przyjmij</button>
            <button type="button" disabled={busy} onClick={() => act("reject")} className="flex-1 px-2 py-1.5 border border-red-300 text-red-700 rounded text-xs">Odmów</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralRealizationCard;
