import React, { createContext, useContext, useState, useCallback } from "react";
import FullScreenLoader from "../components/UtilComponents/ApiLoader";


const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaderProps, setLoaderProps] = useState({
    type: "medical",
    message: "Ładowanie...",
    subMessage: "Proszę poczekać, gdyż ładujemy Twoje dane",
  });

  const showLoader = useCallback((props = {}) => {
    setLoaderProps({
      type: props.type || "medical",
      message: props.message || "Ładowanie...",
      subMessage: props.subMessage || "Proszę poczekać, gdyż ładujemy Twoje dane",
    });
    setIsVisible(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isVisible && <FullScreenLoader {...loaderProps} />}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
