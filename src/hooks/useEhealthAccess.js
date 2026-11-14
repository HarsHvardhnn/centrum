import { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import ehealthAdminHelper from "../helpers/ehealthAdminHelper";

export const NO_ACCESS_HINT = "Brak dostępu do tej usługi. Włącza ją administrator w karcie konta lekarza (Dostęp do usług).";

// One request per signed-in doctor, shared by every component on the page.
let cache = { userId: null, promise: null, services: null };

function load(userId) {
  if (cache.userId !== userId || !cache.promise) {
    cache = {
      userId,
      services: null,
      promise: ehealthAdminHelper
        .getMyProfile()
        .then((res) => {
          const list = (res?.data || res)?.services || [];
          cache.services = Object.fromEntries(list.map((s) => [s.service, Boolean(s.enabled)]));
          return cache.services;
        })
        .catch(() => {
          cache.promise = null; // try again next time; until then nothing is blocked client-side (the server still enforces it)
          return null;
        }),
    };
  }
  return cache.promise;
}

/** Which e-health services the signed-in person may use. Administrators and reception are not limited here. */
export default function useEhealthAccess() {
  const { user } = useUser();
  const userId = user?.id || user?._id || null;
  const isDoctor = user?.role === "doctor";
  const [services, setServices] = useState(isDoctor && cache.userId === userId ? cache.services : null);

  useEffect(() => {
    if (!isDoctor || !userId) return undefined;
    let alive = true;
    load(userId).then((s) => alive && setServices(s));
    return () => { alive = false; };
  }, [isDoctor, userId]);

  // services === null: not known (yet, or the request failed). Do not block then.
  const can = (service) => !isDoctor || !services || services[service] !== false;
  const hasAny = !isDoctor || !services || Object.values(services).some(Boolean);
  return { loaded: !isDoctor || services !== null, can, hasAny };
}

export function resetEhealthAccessCache() {
  cache = { userId: null, promise: null, services: null };
}
