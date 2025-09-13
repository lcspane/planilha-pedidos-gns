// app/(main)/(components)/stats-cards.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrivacy } from "./privacy-provider";

const formatCurrency = (value) => {
  if (typeof value !== 'number') return "R$ 0,00";
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function StatsCards({ data }) {
  const { PrivateValue } = usePrivacy();

  const totais = data.reduce((acc, pedido) => {
    const valor = pedido.valorTotal || 0;
    if (pedido.situacao === 'Finalizado') {
      acc.confirmado += valor;
    } else if (pedido.situacao === 'Cancelado') {
      acc.cancelado += valor;
    } else if (pedido.situacao === 'Pendente') {
      acc.pendente += valor;
    }
    if (pedido.situacao !== 'Cancelado') {
      acc.total += valor;
    }
    return acc;
  }, { total: 0, cancelado: 0, pendente: 0, confirmado: 0 });

  const cardData = [
    { title: "Total (Válidos)", value: totais.total, icon: DollarSign, colorClass: "border-gray-500" },
    { title: "Total Cancelado", value: totais.cancelado, icon: XCircle, colorClass: "border-red-500" },
    { title: "Total Pendente", value: totais.pendente, icon: Clock, colorClass: "border-orange-500" },
    { title: "Total Confirmado", value: totais.confirmado, icon: CheckCircle2, colorClass: "border-green-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index} className={cn("rounded-lg border-2", card.colorClass)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateValue>{formatCurrency(card.value)}</PrivateValue>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}