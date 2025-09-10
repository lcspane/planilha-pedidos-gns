// app/(main)/dashboard/reports/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { PedidosChart } from "../../(components)/pedidos-chart";
import { TopClientesReport } from "../../(components)/top-clientes-report";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "../../(components)/data-table";
import { columns } from "../../(components)/columns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PedidoForm } from "../../(components)/pedido-form";
import { PedidoDetailsModal } from "../../(components)/pedido-details-modal";
import { Button } from "@/components/ui/button";

function AdminReportsView({ allData, allUsers, onUserChange, selectedUser, onOpenDetails, onOpenEdit, onOpenDelete }) {
  const filteredPedidos = useMemo(() => {
    if (!selectedUser || selectedUser === 'todos') {
      return [];
    }
    return allData.filter(p => p.vendedor === selectedUser);
  }, [allData, selectedUser]);
  
  const memoizedColumns = useMemo(() => columns(onOpenEdit, onOpenDelete, onOpenDetails), [onOpenEdit, onOpenDelete, onOpenDetails]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Relatórios por Vendedor</h2>
        <Select onValueChange={onUserChange} value={selectedUser || 'todos'}>
          <SelectTrigger className="w-full md:w-[320px]">
            <SelectValue placeholder="Selecione um vendedor para ver os dados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Selecione um Vendedor</SelectItem>
            {allUsers.map(user => (
              <SelectItem key={user.id} value={user.vendedorPadrao}>
                {user.vendedorPadrao} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedUser && selectedUser !== 'todos' ? (
        <>
          <PedidosChart data={filteredPedidos} />
          <div className="pt-6">
             <Card>
              <CardHeader>
                <CardTitle>Pedidos de {selectedUser}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={memoizedColumns}
                  data={filteredPedidos}
                  openNewModal={() => {}}
                  hideControls={true}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg mt-6">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Selecione um vendedor acima para visualizar seus relatórios e pedidos.</p>
        </div>
      )}
    </div>
  );
}

function UserReportsView({ userData }) {
  return (
    <div className="space-y-6">
      <PedidosChart data={userData} />
      <div className="pt-6">
        <TopClientesReport data={userData} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [allData, setAllData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPedidoId, setDeletingPedidoId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingPedido, setViewingPedido] = useState(null);
  
  async function fetchData() {
    setIsLoading(true);
    try {
      if (session?.user?.role === 'ADMIN') {
        const [pedidosRes, usersRes] = await Promise.all([
          fetch("/api/pedidos/all"),
          fetch("/api/users"),
        ]);
        if (!pedidosRes.ok || !usersRes.ok) throw new Error("Falha ao buscar dados.");
        const pedidos = await pedidosRes.json();
        const users = await usersRes.json();
        setAllData(pedidos);
        setAllUsers(users.filter(u => u.role !== 'ADMIN'));
      } else {
        const response = await fetch("/api/pedidos");
        if (!response.ok) throw new Error("Falha ao buscar dados.");
        const pedidos = await response.json();
        setAllData(pedidos);
      }
    } catch (error) {
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, session]);

  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeletingPedidoId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleOpenDetails = (pedido) => {
    setViewingPedido(pedido);
    setIsDetailsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const isEditing = !!editingPedido;
    const url = isEditing ? `/api/pedidos/${editingPedido.id}` : "/api/pedidos";
    const method = isEditing ? "PUT" : "POST";
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast.success(`Pedido ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      setIsModalOpen(false);
      fetchData(); // Recarrega os dados para refletir a mudança
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPedidoId) return;
    try {
      const response = await fetch(`/api/pedidos/${deletingPedidoId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Falha ao deletar o pedido.");
      toast.success("Pedido deletado com sucesso!");
      fetchData(); // Recarrega os dados
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 flex-shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl">
          {isAdmin ? 'Relatórios Gerenciais' : 'Meus Relatórios'}
        </h1>
      </header>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {isAdmin ? (
          <AdminReportsView
            allData={allData}
            allUsers={allUsers}
            selectedUser={selectedUser}
            onUserChange={setSelectedUser}
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleEdit}
            onOpenDelete={openDeleteDialog}
          />
        ) : (
          <UserReportsView userData={allData} />
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
          </DialogHeader>
          <PedidoForm
            pedido={editingPedido}
            defaultDate={editingPedido ? new Date(editingPedido.data) : new Date()}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <PedidoDetailsModal
        pedido={viewingPedido}
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja realmente excluir este pedido?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}