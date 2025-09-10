// app/(main)/(components)/data-table.jsx
"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { exportToExcel, exportToCSV, exportToPDF } from "@/lib/exportUtils"; // NOVO: Importando as funções

const getRowStyling = (situacao) => {
  switch (situacao) {
    case "Finalizado":
      return "bg-green-100/60 text-green-800 font-medium";
    case "Pendente":
      return "bg-orange-100/60 text-orange-800 font-medium";
    case "Cancelado":
      return "bg-red-100/60 text-red-800 font-medium";
    case "Orçamento":
    default:
      return "";
  }
};

export function DataTable({ columns, data, openNewModal, className, hideControls = false }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  const handleExport = (format) => {
    const fileName = `pedidos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
    if (format === 'excel') {
      exportToExcel(data, fileName);
    } else if (format === 'csv') {
      exportToCSV(data, fileName);
    } else if (format === 'pdf') {
      exportToPDF(data, fileName);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {!hideControls && (
        <div className="flex items-center justify-between py-4 flex-shrink-0">
          <Input
            placeholder="Filtrar por cliente..."
            value={(table.getColumn("cliente")?.getFilterValue()) ?? ""}
            onChange={(event) =>
              table.getColumn("cliente")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            {/* NOVO: Menu de Exportação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>Exportar para Excel (.xlsx)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>Exportar para CSV (.csv)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>Exportar para PDF (.pdf)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={openNewModal}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Pedido
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(getRowStyling(row.original.situacao))}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}