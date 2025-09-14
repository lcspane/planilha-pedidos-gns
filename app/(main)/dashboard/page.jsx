// app/(main)/dashboard/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, parse, isToday, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { columns } from "../(components)/columns";
import { DataTable } from "../(components)/data-table";
import { PedidoForm } from "../(components)/pedido-form";
import { StatsCards } from "../(components)/stats-cards";
import { PedidoDetailsModal } from "../(components)/pedido-details-modal";
import { AdvancedFilters } from "../(components)/advanced-filters";

// A página agora recebe as props do layout
export default function DashboardPage({ globalFilter, isFiltersOpen, setIsFiltersOpen, setGlobalFilter }) {
  const { status } = useSession();
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPedidoId, setDeletingPedidoId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingPedido, setViewingPedido] = useState(null);
  const currentMonthKey = format(new Date(), "MMMM-yyyy", { locale: ptBR });
  const [monthFilter, setMonthFilter] = useState(currentMonthKey);
  const [activeFilters, setActiveFilters] = useState({});

  async function fetchData() { setIsLoading(true); try { const response = await fetch("/api/pedidos"); if (!response.ok) throw new Error("Falha ao buscar os dados."); const pedidos = await response.json(); setAllData(pedidos); } catch (error) { console.error(error); toast.error("Não foi possível carregar os pedidos."); } finally { setIsLoading(false); } }
  const handleEdit = (pedido) => { setEditingPedido(pedido); setIsModalOpen(true); };
  const handleNew = () => { setEditingPedido(null); setIsModalOpen(true); };
  const openDeleteDialog = (id) => { setDeletingPedidoId(id); setIsDeleteDialogOpen(true); };
  const handleOpenDetails = (pedido) => { setViewingPedido(pedido); setIsDetailsModalOpen(true); };
  const handleDeleteConfirm = async () => { if (!deletingPedidoId) return; try { const response = await fetch(`/api/pedidos/${deletingPedidoId}`, { method: "DELETE" }); if (!response.ok) throw new Error("Falha ao deletar o pedido."); toast.success("Pedido deletado com sucesso!"); fetchData(); } catch (error) { console.error(error); toast.error(error.message); } finally { setIsDeleteDialogOpen(false); setDeletingPedidoId(null); } };
  const handleFormSubmit = async (formData) => { const isEditing = !!editingPedido; const url = isEditing ? `/api/pedidos/${editingPedido.id}` : "/api/pedidos"; const method = isEditing ? "PUT" : "POST"; try { const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} o pedido.`); toast.success(`Pedido ${isEditing ? 'atualizado' : 'criado'} com sucesso!`); setIsModalOpen(false); fetchData(); } catch (error) { console.error(error); toast.error(error.message); } };

  useEffect(() => { if (status === "authenticated") { fetchData(); } }, [status]);
  useEffect(() => { if (status === "unauthenticated") { router.push("/login"); } }, [status, router]);

  const uniqueMonths = useMemo(() => { const monthSet = new Set(allData.map(p => format(new Date(p.data), "MMMM-yyyy", { locale: ptBR }))); monthSet.add(currentMonthKey); return Array.from(monthSet).sort((a, b) => { const dateA = parse(a, "MMMM-yyyy", new Date(), { locale: ptBR }); const dateB = parse(b, "MMMM-yyyy", new Date(), { locale: ptBR }); return dateA - dateB; }); }, [allData, currentMonthKey]);
  
  const filteredData = useMemo(() => {
    let data = allData;
    if (globalFilter) {
      const filterText = globalFilter.toLowerCase();
      return data.filter(p => p.cliente.toLowerCase().includes(filterText) || (p.contato && p.contato.toLowerCase().includes(filterText)) || (p.referencia && p.referencia.toLowerCase().includes(filterText)));
    }
    if (Object.values(activeFilters).some(v => v !== null && v !== undefined)) {
      return data.filter(p => {
        const { situacao, valorMin, valorMax, dateRange } = activeFilters;
        if (situacao && p.situacao !== situacao) return false;
        if (valorMin != null && p.valorTotal < valorMin) return false;
        if (valorMax != null && p.valorTotal > valorMax) return false;
        if (dateRange?.from && !dateRange.to) { if (new Date(p.data) < dateRange.from) return false; }
        if (dateRange?.from && dateRange?.to) { if (!isWithinInterval(new Date(p.data), { start: dateRange.from, end: dateRange.to })) return false; }
        return true;
      });
    }
    return data.filter(p => format(new Date(p.data), "MMMM-yyyy", { locale: ptBR }) === monthFilter);
  }, [allData, monthFilter, globalFilter, activeFilters]);

  const cardTotals = useMemo(() => {
    return filteredData.reduce((acc, pedido) => {
      const valor = pedido.valorTotal || 0;
      if (pedido.situacao === 'Finalizado') { acc.confirmado += valor; }
      else if (pedido.situacao === 'Cancelado') { acc.cancelado += valor; }
      else if (pedido.situacao === 'Pendente') { acc.pendente += valor; }
      if (pedido.situacao !== 'Cancelado') { acc.total += valor; }
      return acc;
    }, { total: 0, cancelado: 0, pendente: 0, confirmado: 0 });
  }, [filteredData]);

  const followUpHoje = useMemo(() => { return allData.filter(pedido => pedido.proximoContato && isToday(new Date(pedido.proximoContato))); }, [allData]);
  const memoizedColumns = useMemo(() => columns(handleEdit, openDeleteDialog, handleOpenDetails), []);
  const defaultDateForNew = useMemo(() => { return parse(monthFilter, "MMMM-yyyy", new Date(), { locale: ptBR }); }, [monthFilter]);
  const handleApplyFilters = (filters) => { setActiveFilters(filters); if (setGlobalFilter) { setGlobalFilter(''); } setIsFiltersOpen(false); };
  const handleClearFilters = () => { setActiveFilters({}); setIsFiltersOpen(false); };
  const isAnyFilterActive = globalFilter || Object.values(activeFilters).some(v => v !== null && v !== undefined);

  if (status === "loading" || isLoading) { return (<div className="flex justify-center items-center flex-1"><Loader2 className="h-16 w-16 animate-spin" /></div>); }

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">{isAnyFilterActive ? 'Resultados dos Filtros' : 'Visão Geral Mensal'}</h1>
        </div>
        <div className="md:hidden">
          <Select value={isAnyFilterActive ? '' : monthFilter} onValueChange={setMonthFilter} disabled={isAnyFilterActive}>
            <SelectTrigger><SelectValue placeholder="Selecione o mês..." /></SelectTrigger>
            <SelectContent>{uniqueMonths.map((month) => (<SelectItem key={month} value={month} className="capitalize">{month.replace('-', ' ')}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="hidden md:block">
          <Tabs value={isAnyFilterActive ? '' : monthFilter} onValueChange={setMonthFilter}>
            <TabsList className="overflow-x-auto whitespace-nowrap justify-start">
              {uniqueMonths.map((month) => (<TabsTrigger key={month} value={month} disabled={isAnyFilterActive} className="capitalize">{month.replace('-', ' ')}</TabsTrigger>))}
            </TabsList>
          </Tabs>
        </div>
        <div className="space-y-6">
          <StatsCards totals={cardTotals} />
          {followUpHoje.length > 0 && !isAnyFilterActive && (<Card className="bg-blue-50 border-blue-200"><CardHeader><CardTitle className="text-blue-800">Follow-ups para Hoje ({followUpHoje.length})</CardTitle></CardHeader><CardContent><ul className="space-y-2">{followUpHoje.map(pedido => (<li key={pedido.id} className="text-sm"><span className="font-semibold text-blue-700">{pedido.cliente}</span><span className="text-gray-600"> - Contato: {pedido.contato || 'N/A'}</span></li>))}</ul></CardContent></Card>)}
          <DataTable columns={memoizedColumns} data={filteredData} openNewModal={handleNew} onImportSuccess={fetchData} handleOpenDetails={handleOpenDetails} handleEdit={handleEdit} handleDelete={openDeleteDialog} />
        </div>
      </main>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}><DialogContent className="sm:max-w-[625px]"><DialogHeader><DialogTitle>{editingPedido ? "Editar Pedido" : "Adicionar Novo Pedido"}</DialogTitle></DialogHeader><PedidoForm pedido={editingPedido} defaultDate={defaultDateForNew} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} /></DialogContent></Dialog>
      <PedidoDetailsModal pedido={viewingPedido} isOpen={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá deletar permanentemente o pedido do servidor.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AdvancedFilters isOpen={isFiltersOpen} onOpenChange={setIsFiltersOpen} onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
    </>
  );
}