// app/(main)/(components)/columns.jsx
"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formatCurrency = (value) => {
  if (typeof value !== 'number') return "R$ 0,00";
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const extractRefNumber = (ref) => {
  if (!ref || typeof ref !== 'string') return '';
  return ref.replace(/\D/g, '');
};

export function columns(openEditModal, openDeleteDialog, openDetailsModal) {
  return [
    {
      accessorKey: "situacao",
      header: "Situação",
    },
    {
      accessorKey: "data",
      header: "Data",
      cell: ({ row }) => format(new Date(row.getValue("data")), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue("cliente")}</div>,
    },
    {
      accessorKey: "contato",
      header: "Contato",
      cell: ({ row }) => <div>{row.getValue("contato") || '-'}</div>,
    },
    {
      accessorKey: "referencia",
      header: "Referência",
      cell: ({ row }) => {
        const fullReference = row.getValue("referencia");
        const referenceNumber = extractRefNumber(fullReference);
        const handleCopy = (e) => {
          e.stopPropagation();
          if (referenceNumber) {
            navigator.clipboard.writeText(referenceNumber);
            toast.success(`Referência "${referenceNumber}" copiada!`);
          }
        };
        return (
          <button
            onClick={handleCopy}
            className="cursor-pointer hover:underline focus:outline-none"
            title="Clique para copiar o número da referência"
          >
            {fullReference || '-'}
          </button>
        );
      },
    },
    {
      accessorKey: "valorTotal",
      header: () => <div className="text-right">Valor Total</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("valorTotal"));
        return <div className="text-right">{formatCurrency(amount)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const pedido = row.original;
        return (
          <div className="flex items-center justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openDetailsModal(pedido)}
              title="Ver detalhes"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEditModal(pedido)}
              title="Editar pedido"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700"
              onClick={() => openDeleteDialog(pedido.id)}
              title="Deletar pedido"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}