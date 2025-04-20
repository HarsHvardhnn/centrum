import React, { createContext, useContext, useState, useCallback } from "react";
import FullScreenLoader from "../components/UtilComponents/ApiLoader";


const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaderProps, setLoaderProps] = useState({
    type: "medical",
    message: "Loading...",
    subMessage: "Please wait while we fetch your data",
  });

  const showLoader = useCallback((props = {}) => {
    setLoaderProps({
      type: props.type || "medical",
      message: props.message || "Loading...",
      subMessage: props.subMessage || "Please wait while we fetch your data",
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
