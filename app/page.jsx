// app/page.jsx
"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Building2, LogIn, LogOut, LayoutDashboard } from 'lucide-react';

export default function SplashPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black p-10 flex-col text-center">
      <Building2 className="h-16 w-16 text-white mb-6" />
      <h1 className="mt-6 text-4xl font-bold text-white">
        GNS - Gestão de Orçamentos
      </h1>
      <p className="mt-4 max-w-lg text-lg text-zinc-400">
        Uma solução interna criada por Lucas Pane para otimizar a fluxo de vendas e orçamentos.
      </p>
      <div className="mt-10 flex gap-4">
        {isLoading ? (
          <Button size="lg" disabled>Carregando...</Button>
        ) : session ? (
          <>
            <Link href="/dashboard" passHref>
              <Button size="lg" variant="secondary">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Acessar Dashboard
              </Button>
            </Link>
            <Button size="lg" onClick={() => signOut()}>
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </>
        ) : (
          <Link href="/login" passHref>
            <Button size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              Entrar
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}