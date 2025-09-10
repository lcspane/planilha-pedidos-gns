// app/(main)/(components)/user-columns.jsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const userColumns = (onEdit, onDelete) => [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "vendedorPadrao",
    header: "Vendedor Padrão",
  },
  {
    accessorKey: "role",
    header: "Permissão",
    cell: ({ row }) => {
      const role = row.getValue("role");
      return <Badge variant={role === 'ADMIN' ? 'destructive' : 'secondary'}>{role}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return <Badge variant={status === 'ATIVO' ? 'default' : 'outline'}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center justify-end space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(user)} title="Editar usuário">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => onDelete(user.id)} title="Deletar usuário">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];