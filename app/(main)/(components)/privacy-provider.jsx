// app/(main)/(components)/privacy-provider.jsx
"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

const PrivacyContext = createContext();

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export function PrivacyProvider({ children }) {
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('privacyMode');
    if (savedState !== null) {
      setIsPrivate(JSON.parse(savedState));
    }
  }, []);

  const togglePrivacy = () => {
    const newState = !isPrivate;
    setIsPrivate(newState);
    localStorage.setItem('privacyMode', JSON.stringify(newState));
  };
  
  const PrivateValue = ({ children }) => {
    if (isPrivate) {
      return <span className="font-semibold tracking-wider">R$ ●●●●,●●</span>;
    }
    return <>{children}</>;
  };

  const value = {
    isPrivate,
    togglePrivacy,
    PrivateValue,
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
}