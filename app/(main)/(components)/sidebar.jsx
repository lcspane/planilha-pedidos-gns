// app/(main)/(components)/sidebar.jsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Package, LineChart, Settings, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);

  return (
    <>
      <div className="hidden border-r bg-muted/40 md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span>GNS - Gás Norte</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === "/dashboard" && "bg-muted text-primary"
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/reports"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === "/dashboard/reports" && "bg-muted text-primary"
              )}
            >
              <LineChart className="h-4 w-4" />
              Relatórios
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/users"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === "/dashboard/users" && "bg-muted text-primary"
                )}
              >
                <Users className="h-4 w-4" />
                Usuários
              </Link>
            )}
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === "/dashboard/settings" && "bg-muted text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">Logado como:</p>
            <p className="font-semibold">{session?.user?.vendedor || session?.user?.email}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setIsLogoutAlertOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza de que deseja encerrar sua sessão?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut({ callbackUrl: '/' })}>Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}