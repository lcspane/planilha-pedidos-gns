// app/(main)/(components)/header.jsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePrivacy } from "./privacy-provider";
import { useApp } from "./app-provider"; // NOVO
import Link from "next/link";
import {
  Home, LineChart, Users, Settings, Package, Menu, Search, SlidersHorizontal, User as UserIcon, LogOut, Eye as EyeIcon, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// O Header não recebe mais props, ele pega tudo do contexto
export function Header() {
  const { data: session } = useSession();
  const { isPrivate, togglePrivacy } = usePrivacy();
  const { globalFilter, setGlobalFilter, setIsFiltersOpen } = useApp();
  const isAdmin = session?.user?.role === 'ADMIN';

  const navLinks = (
    <nav className="grid gap-4 text-base font-medium">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4"><Package className="h-6 w-6" /><span>GNS Pedidos</span></Link>
      <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"><Home className="h-5 w-5" />Dashboard</Link>
      <Link href="/dashboard/reports" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"><LineChart className="h-5 w-5" />Relatórios</Link>
      {isAdmin && (<Link href="/dashboard/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"><Users className="h-5 w-5" />Usuários</Link>)}
      <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"><Settings className="h-5 w-5" />Configurações</Link>
    </nav>
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden"><Sheet><SheetTrigger asChild><Button variant="outline" size="icon"><Menu className="h-5 w-5" /><span className="sr-only">Abrir menu</span></Button></SheetTrigger><SheetContent side="left"><SheetHeader><SheetTitle className="sr-only">Menu</SheetTitle></SheetHeader>{navLinks}</SheetContent></Sheet></div>
      <div className="relative w-full flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Pesquisar..." className="w-full rounded-lg bg-muted pl-8" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} /></div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(true)} className="hidden sm:inline-flex"><SlidersHorizontal className="mr-2 h-4 w-4" />Filtros</Button>
        <Button variant="outline" size="icon" onClick={togglePrivacy} title={isPrivate ? "Mostrar" : "Ocultar"}><_components.EyeIcon_ className={!isPrivate ? "hidden" : ""} /><EyeOff className={isPrivate ? "hidden" : ""} /></Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="rounded-full"><UserIcon className="h-5 w-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Conta</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem disabled>{session?.user?.email}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Sair</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>
    </header>
  );
}