import React, { createContext, useEffect, useState } from "react";
import API from "../services/api";

export const FooterContext = createContext();

export const FooterProvider = ({ children }) => {
  const [footer, setFooter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get("footer/")
      .then((res) => {
        setFooter(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Footer fetch error:", err.message);
        setError(err.message);
      });
  }, []);

  return (
    <FooterContext.Provider value={{ footer, error }}>
      {children}
    </FooterContext.Provider>
  );
};

export default FooterProvider;