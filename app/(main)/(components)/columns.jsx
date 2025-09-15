// app/(main)/(components)/columns.jsx
'use client';

import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

const formatCurrency = (value) => { if (typeof value !== 'number') return "R$ 0,00"; return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
const extractRefNumber = (ref) => { if (!ref || typeof ref !== 'string') return ''; return ref.replace(/\D/g, ''); };
const extractDocumentNumber = (clientString) => { if (!clientString || typeof clientString !== 'string') return null; const match = clientString.match(/\b\d{11,14}\b/g) || clientString.match(/\b\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{4}[\s.-]?\d{2}\b/g) || clientString.match(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{2}\b/g); return match ? (match[0] || '').replace(/\D/g, '') : null; };
const formatDocument = (docNumber) => { if (!docNumber) return null; if (docNumber.length === 11) { return docNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); } if (docNumber.length === 14) { return docNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); } return docNumber; };

const ValorTotalCell = ({ row }) => {
  const amount = parseFloat(row.getValue("valorTotal"));
  return (<div className="text-right">{formatCurrency(amount)}</div>);
};

export function columns(openEditModal, openDeleteDialog, openDetailsModal) {
  return [
    { accessorKey: "situacao", header: "Situação" },
    { accessorKey: "data", header: "Data", cell: ({ row }) => format(new Date(row.getValue("data")), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => {
        const cliente = row.getValue("cliente");
        const documentNumber = extractDocumentNumber(cliente);

        const handleCopyDocument = (e) => {
          e.stopPropagation();
          if (documentNumber) {
            const formattedDoc = formatDocument(documentNumber);
            navigator.clipboard.writeText(formattedDoc);
            toast.success(`${documentNumber.length === 11 ? 'CPF' : 'CNPJ'} "${formattedDoc}" copiado!`);
          }
        };
        
        // Se um documento for encontrado, torna o texto clicável
        if (documentNumber) {
          return (
            <button
              onClick={handleCopyDocument}
              className="max-w-[300px] truncate text-left hover:underline focus:outline-none"
              title={`Clique para copiar o documento: ${formatDocument(documentNumber)}`}
            >
              {cliente}
            </button>
          );
        }
        
        // Se não houver documento, apenas exibe o texto
        return <div className="max-w-[300px] truncate">{cliente}</div>;
      },
    },
    { accessorKey: "contato", header: "Contato", cell: ({ row }) => <div>{row.getValue("contato") || '-'}</div> },
    {
      accessorKey: "referencia",
      header: "Referência",
      cell: ({ row }) => {
        const fullReference = row.getValue("referencia");
        const referenceNumber = extractRefNumber(fullReference);
        const handleCopyRef = (e) => {
          e.stopPropagation();
          if (referenceNumber) {
            navigator.clipboard.writeText(referenceNumber);
            toast.success(`Referência "${referenceNumber}" copiada!`);
          }
        };
        return (
          <button
            onClick={handleCopyRef}
            className="cursor-pointer hover:underline focus:outline-none"
            title="Clique para copiar o número da referência"
          >
            {fullReference || '-'}
          </button>
        );
      },
    },
    { accessorKey: "valorTotal", header: () => <div className="text-right">Valor Total</div>, cell: ValorTotalCell },
    {
      id: "actions",
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => {
        const pedido = row.original;
        return (
          <div className="flex items-center justify-end space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetailsModal(pedido)} title="Ver detalhes"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(pedido)} title="Editar pedido"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => openDeleteDialog(pedido.id)} title="Deletar pedido"><Trash2 className="h-4 w-4" /></Button>
          </div>
        );
      },
    },
  ];
}