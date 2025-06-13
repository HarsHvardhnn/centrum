import { useEffect } from "react";

const TAWKTO_SRC = "https://embed.tawk.to/6816e275f496ef1910abd5c8/1iqcm96v9";

const TawkToWidget = () => {
  useEffect(() => {
    
    if (window.Tawk_API) return; // Prevent multiple injections
    //("TawkToWidget0tst", window);
    const s1 = document.createElement("script");

    // s1.onload = () => {
    //   //("TawkToWidget", window.Tawk_API.getStatus);
    // };

    s1.async = true;
    s1.src = TAWKTO_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);
    const style = document.createElement("style");
    style.innerHTML = `
      img[src*="attention-grabbers"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    //("TawkToWidget", document.head);
    // No cleanup needed, widget handles itself
  }, []);
  return null;
};

export default TawkToWidget; 