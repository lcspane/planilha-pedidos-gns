// app/(main)/layout.jsx
"use client";

import { Sidebar } from "./(components)/sidebar";
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

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isKickedOut, setIsKickedOut] = useState(false);

  // EFEITO 1: LÓGICA DE EXPIRAÇÃO DE SESSÃO (15 MINUTOS)
  useEffect(() => {
    // Se o usuário já foi desconectado por outro motivo, não faz nada
    if (isKickedOut) return;

    const checkStatus = () => {
      // Se a sessão se tornou 'unauthenticated' e não foi por 'kick out',
      // então foi por expiração de tempo.
      if (status === 'unauthenticated' && !isKickedOut) {
        setIsSessionExpired(true);
      }
    };
    const interval = setInterval(checkStatus, 2000); // Verifica a cada 2 segundos
    return () => clearInterval(interval);
  }, [status, isKickedOut]);

  // EFEITO 2: VERIFICAÇÃO DE LOGIN ÚNICO EM EVENTOS RELEVANTES
  useEffect(() => {
    const verifySessionOnFocus = async () => {
      // Roda a verificação apenas se o usuário estiver logado
      // e nenhum modal de erro já estiver ativo
      if (status === 'authenticated' && !isKickedOut && !isSessionExpired) {
        try {
          const response = await fetch('/api/auth/verify-session', { method: 'POST' });
          if (!response.ok) {
            // Se a API retornar erro (ex: 401), trata como sessão expirada
            if (response.status === 401) setIsSessionExpired(true);
            return;
          }
          const data = await response.json();
          if (!data.valid) {
            setIsKickedOut(true);
          }
        } catch (error) {
          console.error("Falha ao verificar sessão no evento 'focus'", error);
        }
      }
    };

    // Adiciona "escutadores" de eventos no navegador
    window.addEventListener('focus', verifySessionOnFocus); // Quando a aba se torna ativa
    window.addEventListener('online', verifySessionOnFocus); // Quando a internet volta

    // Limpa os "escutadores" quando o componente é desmontado
    return () => {
      window.removeEventListener('focus', verifySessionOnFocus);
      window.removeEventListener('online', verifySessionOnFocus);
    };
  }, [status, isKickedOut, isSessionExpired]); // Depende dos estados para não rodar desnecessariamente

  // EFEITO 3: LOGOUT AO FECHAR A ABA
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session) {
        navigator.sendBeacon('/api/auth/signout-beacon', new Blob([JSON.stringify({ csrfToken: session.csrfToken })], { type: 'application/json' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  const handleSessionExpiredConfirm = () => {
    localStorage.setItem('logoutReason', 'Sua sessão expirou por inatividade.');
    signOut({ callbackUrl: '/login' });
  };
  
  const handleKickedOutConfirm = () => {
    localStorage.setItem('logoutReason', 'Sessão encerrada por novo login em outro local.');
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col h-screen overflow-hidden">
        <Toaster position="top-right" richColors />
        {children}
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

      <AlertDialog open={isKickedOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sessão Encerrada</AlertDialogTitle>
            <AlertDialogDescription>Esta sessão foi encerrada porque um novo login foi detectado em outro dispositivo ou navegador.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleKickedOutConfirm}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}