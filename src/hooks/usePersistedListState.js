import { useLayoutEffect, useRef } from "react";

const PREFIX = "centrum.list.";

export function readListState(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeListState(key, value) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export function clearAllListState() {
  try {
    const toRemove = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const storageKey = sessionStorage.key(i);
      if (storageKey && storageKey.startsWith(PREFIX)) {
        toRemove.push(storageKey);
      }
    }
    toRemove.forEach((storageKey) => sessionStorage.removeItem(storageKey));
  } catch {
    // ignore
  }
}

/** Use in filter-change effects so a restored page is not reset on mount. */
export function useSkipFirstEffect() {
  const skipRef = useRef(true);
  return () => {
    if (skipRef.current) {
      skipRef.current = false;
      return true;
    }
    return false;
  };
}

export function useListScrollRestore(key, ready = true) {
  const restoredRef = useRef(false);

  useLayoutEffect(() => {
    if (!ready || restoredRef.current) return undefined;
    restoredRef.current = true;
    const storageKey = `${PREFIX}${key}.scroll`;
    const y = Number(sessionStorage.getItem(storageKey) || 0);
    if (y > 0) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
    return undefined;
  }, [key, ready]);

  useLayoutEffect(() => {
    const storageKey = `${PREFIX}${key}.scroll`;
    return () => {
      try {
        sessionStorage.setItem(storageKey, String(window.scrollY || 0));
      } catch {
        // ignore
      }
    };
  }, [key]);
}
