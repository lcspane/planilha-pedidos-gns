// app/(main)/(components)/header.jsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePrivacy } from "./privacy-provider";
import Link from "next/link";
import {
  Home,
  LineChart,
  Users,
  Settings,
  Package,
  Menu,
  Search,
  SlidersHorizontal,
  User as UserIcon,
  LogOut,
  Eye as EyeIcon,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader, // NOVO: Importando o Header do Sheet
  SheetTitle,  // NOVO: Importando o Título do Sheet
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header({ globalFilter, setGlobalFilter, setIsFiltersOpen }) {
  const { data: session } = useSession();
  const { isPrivate, togglePrivacy } = usePrivacy();
  const isAdmin = session?.user?.role === 'ADMIN';

  const navLinks = (
    <nav className="grid gap-6 text-lg font-medium">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-semibold mb-4"
      >
        <Package className="h-6 w-6" />
        <span>GNS Pedidos</span>
      </Link>
      <Link href="/dashboard" className="hover:text-foreground">
        Dashboard
      </Link>
      <Link
        href="/dashboard/reports"
        className="text-muted-foreground hover:text-foreground"
      >
        Relatórios
      </Link>
      {isAdmin && (
        <Link
          href="/dashboard/users"
          className="text-muted-foreground hover:text-foreground"
        >
          Usuários
        </Link>
      )}
      <Link
        href="/dashboard/settings"
        className="text-muted-foreground hover:text-foreground"
      >
        Configurações
      </Link>
    </nav>
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            {/* CORREÇÃO: Adicionamos um título para acessibilidade */}
            <SheetHeader>
              <SheetTitle className="sr-only">Menu Principal</SheetTitle>
            </SheetHeader>
            {navLinks}
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="relative w-full flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar em todos os pedidos..."
          className="w-full rounded-lg bg-muted pl-8"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersOpen(true)}
          className="hidden sm:inline-flex"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={togglePrivacy}
          title={isPrivate ? "Mostrar Valores" : "Ocultar Valores"}
        >
          {isPrivate ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserIcon className="h-5 w-5" />
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>{session?.user?.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}