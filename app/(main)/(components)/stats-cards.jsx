// app/(main)/(components)/stats-cards.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const formatCurrency = (value) => {
  if (typeof value !== 'number') return "R$ 0,00";
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function StatsCards({ data }) {
  const totais = data.reduce((acc, pedido) => {
    const valor = pedido.valorTotal || 0;
    
    if (pedido.situacao === 'Finalizado') {
      acc.confirmado += valor;
    } else if (pedido.situacao === 'Cancelado') {
      acc.cancelado += valor;
    } else if (pedido.situacao === 'Pendente') {
      acc.pendente += valor;
    } else if (pedido.situacao === 'Orçamento') {
      acc.orcamento += valor;
    }
    
    return acc;
  }, { confirmado: 0, cancelado: 0, pendente: 0, orcamento: 0 });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-[#008000]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Confirmado</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(totais.confirmado)}</div></CardContent>
      </Card>
      
      <Card className="border-l-4 border-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total em Orçamento</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(totais.orcamento)}</div></CardContent>
      </Card>
      
      <Card className="border-l-4 border-[#e36c09]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pendente</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(totais.pendente)}</div></CardContent>
      </Card>
      
      <Card className="border-l-4 border-[#c00000]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Cancelado</CardTitle><XCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(totais.cancelado)}</div></CardContent>
      </Card>
    </div>
  );
}