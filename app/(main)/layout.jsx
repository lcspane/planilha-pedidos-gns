// app/(main)/layout.jsx
"use client";

import React from "react";
import { Sidebar } from "./(components)/sidebar";
import { Header } from "./(components)/header";
import { Toaster } from "sonner";
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PrivacyProvider } from "./(components)/privacy-provider";

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const [globalFilter, setGlobalFilter] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // CORREÇÃO: O estado 'activeFilters' agora vive aqui, no layout.
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    const checkStatus = () => {
      if (status === 'unauthenticated') {
        setIsSessionExpired(true);
      }
    };
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [status]);

  const handleSessionExpiredConfirm = () => {
    localStorage.setItem('logoutReason', 'Sua sessão expirou.');
    signOut({ callbackUrl: '/login' });
  };
  
  // Passamos todos os estados e funções de filtro para as páginas filhas
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        globalFilter,
        setGlobalFilter,
        isFiltersOpen,
        setIsFiltersOpen,
        activeFilters,
        setActiveFilters,
      });
    }
    return child;
  });

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[224px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Toaster position="top-right" richColors />
        <PrivacyProvider>
          <Header
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            setIsFiltersOpen={setIsFiltersOpen}
          />
          {childrenWithProps}
        </PrivacyProvider>
      </div>
      <AlertDialog open={isSessionExpired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sessão Expirada</AlertDialogTitle>
            <AlertDialogDescription>Sua sessão expirou por inatividade. Faça login novamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSessionExpiredConfirm}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}