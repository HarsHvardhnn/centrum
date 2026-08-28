import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import FullScreenLoader from "../components/UtilComponents/ApiLoader";


const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaderProps, setLoaderProps] = useState({
    type: "medical",
    message: "Ładowanie...",
    subMessage: "Proszę poczekać, gdyż ładujemy Twoje dane",
  });
  const visibleCountRef = useRef(0);

  const showLoader = useCallback((props = {}) => {
    visibleCountRef.current += 1;
    setLoaderProps({
      type: props.type || "medical",
      message: props.message || "Ładowanie...",
      subMessage: props.subMessage || "Proszę poczekać, gdyż ładujemy Twoje dane",
    });
    setIsVisible(true);
  }, []);

  const hideLoader = useCallback(() => {
    visibleCountRef.current = Math.max(0, visibleCountRef.current - 1);
    if (visibleCountRef.current === 0) {
      setIsVisible(false);
    }
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isVisible && <FullScreenLoader {...loaderProps} />}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
