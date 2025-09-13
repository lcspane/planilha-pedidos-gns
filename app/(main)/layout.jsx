// app/(main)/layout.jsx
"use client";

import { Sidebar } from "./(components)/sidebar";
import { Toaster } from "sonner";
import { PrivacyProvider } from "./(components)/privacy-provider";
// Todos os hooks e lógica de verificação de sessão foram removidos

export default function DashboardLayout({ children }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[224px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Toaster position="top-right" richColors />
        <PrivacyProvider>
          {children}
        </PrivacyProvider>
      </div>
    </div>
  );
}