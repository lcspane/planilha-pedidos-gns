// app/(main)/(components)/app-provider.jsx
"use client";

import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const value = {
    globalFilter,
    setGlobalFilter,
    isFiltersOpen,
    setIsFiltersOpen,
    activeFilters,
    setActiveFilters,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}