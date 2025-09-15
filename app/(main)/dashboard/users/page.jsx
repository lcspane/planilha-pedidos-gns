// app/(main)/dashboard/users/page.jsx
'use client';

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { userColumns } from "../../(components)/user-columns";
import { UserForm } from "../../(components)/user-form";
// A DataTable aqui precisa de uma versão que NÃO tenha o botão "Adicionar Pedido"
// Vamos criar uma cópia simplificada ou modificar a existente. Por agora, vamos usar um DataTable genérico.

// Componente simples de tabela para usuários, sem o botão de adicionar
function UserDataTable({ columns, data }) {
  const { getHeaderGroups, getRowModel } = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>{getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
        <TableBody>{getRowModel().rows?.length ? (getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhum usuário encontrado.</TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  );
}
// Importações adicionais para o UserDataTable
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      toast.error("Acesso negado.");
      router.push('/dashboard');
    }
  }, [session, status, router]);

  async function fetchUsers() { setIsLoading(true); try { const response = await fetch('/api/users'); if (!response.ok) throw new Error("Falha ao buscar usuários."); const data = await response.json(); setUsers(data); } catch (error) { toast.error(error.message); } finally { setIsLoading(false); } }

  useEffect(() => { if (session?.user?.role === 'ADMIN') { fetchUsers(); } }, [session]);

  const handleNew = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };
  const handleDelete = (id) => { setDeletingUserId(id); setIsDeleteDialogOpen(true); };
  
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/users/${deletingUserId}`, { method: 'DELETE' });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || "Falha ao deletar usuário."); }
      toast.success("Usuário deletado com sucesso!");
      fetchUsers();
    } catch (error) { toast.error(error.message); } finally { setIsDeleteDialogOpen(false); }
  };

  const handleFormSubmit = async (formData) => {
    const isEditing = !!editingUser;
    const url = isEditing ? `/api/users/${editingUser.id}` : '/api/users';
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast.success(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) { toast.error(error.message); }
  };

  const memoizedColumns = useMemo(() => userColumns(handleEdit, handleDelete), []);

  if (isLoading) { return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin" /></div>; }
  if (session?.user?.role !== 'ADMIN') { return null; }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Gerenciamento de Usuários</h1>
        </div>
        <Button onClick={handleNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <Card>
          <CardContent className="pt-6">
            <UserDataTable columns={memoizedColumns} data={users} />
          </CardContent>
        </Card>
      </main>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}><DialogContent><DialogHeader><DialogTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle></DialogHeader><UserForm user={editingUser} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} /></DialogContent></Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Deseja realmente excluir este usuário?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}