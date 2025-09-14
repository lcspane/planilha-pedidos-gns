// app/(main)/(components)/data-table.jsx
"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye, Pencil, Trash2, Upload, Download, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ImportModal } from "./import-modal";
import { exportToExcel, exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { usePrivacy } from "./privacy-provider";

const formatCurrency = (value) => { if (typeof value !== 'number') return "R$ 0,00"; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const getBadgeVariant = (situacao) => { switch (situacao) { case "Finalizado": return "success"; case "Pendente": return "warning"; case "Cancelado": return "destructive"; default: return "secondary"; } };
const getRowStyling = (situacao) => { switch (situacao) { case "Finalizado": return "bg-green-100/60 text-green-800 font-bold"; case "Pendente": return "bg-orange-100/60 text-orange-800 font-bold"; case "Cancelado": return "bg-red-100/60 text-red-800 font-bold"; default: return "font-normal"; } };

export function DataTable({ columns, data, openNewModal, onImportSuccess, handleOpenDetails, handleEdit, handleDelete, hideControls = false }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { PrivateValue } = usePrivacy();

  const handleExport = (format) => {
    const fileName = `pedidos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
    if (format === 'excel') { exportToExcel(data, fileName); }
    else if (format === 'csv') { exportToCSV(data, fileName); }
    else if (format === 'pdf') { exportToPDF(data, fileName); }
  };
  
  return (
    <>
      <div className="flex flex-col h-full">
        {/* CORREÇÃO: Container de controles acima da tabela */}
        {!hideControls && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
            <Input
              placeholder="Filtrar por cliente..."
              value={(table.getColumn("cliente")?.getFilterValue()) ?? ""}
              onChange={(event) => table.getColumn("cliente")?.setFilterValue(event.target.value)}
              className="w-full md:max-w-sm"
            />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button onClick={openNewModal} className="bg-zinc-900 text-white hover:bg-zinc-800 flex-1 md:flex-none">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Pedido
              </Button>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="flex-1 md:flex-none">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 md:flex-none">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>Excel (.xlsx)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>CSV (.csv)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF (.pdf)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Container da Tabela (Desktop) com scroll */}
        <div className="hidden md:block rounded-md border flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary z-10">
              {table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id} className="whitespace-nowrap">{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => (<TableRow key={row.id} className={cn(getRowStyling(row.original.situacao))}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id} className="whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhum pedido encontrado.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </div>
        
        {/* Container dos Cards (Mobile) com scroll */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-auto">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Card key={row.id} className={cn("w-full", getRowStyling(row.original.situacao))}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium truncate">{row.original.cliente}</CardTitle>
                  <Badge variant={getBadgeVariant(row.original.situacao)}>{row.original.situacao}</Badge>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Data:</span><span>{format(new Date(row.original.data), 'dd/MM/yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Valor:</span><span className="font-bold"><PrivateValue>{formatCurrency(row.original.valorTotal)}</PrivateValue></span></div>
                </CardContent>
                <CardFooter className="flex justify-end gap-1 p-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(row.original)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-10">Nenhum pedido encontrado.</p>
          )}
        </div>

        {/* Container da Paginação (Abaixo da tabela) */}
        <div className="flex items-center justify-end space-x-2 pt-4 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
        </div>
      </div>
      {!hideControls && <ImportModal isOpen={isImportModalOpen} onOpenChange={setIsImportModalOpen} onImportSuccess={onImportSuccess} />}
    </>
  );
}