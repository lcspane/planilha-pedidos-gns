// app/(components)/pedidos-chart.jsx
"use client";

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

export function PedidosChart({ data }) {
  const monthlyData = data.reduce((acc, pedido) => {
    const month = format(new Date(pedido.data), 'MMMM', { locale: ptBR });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    if (!acc[capitalizedMonth]) {
      acc[capitalizedMonth] = { name: capitalizedMonth, total: 0 };
    }
    acc[capitalizedMonth].total += pedido.valorTotal;
    return acc;
  }, {});
  
  const chartData = Object.values(monthlyData);

  const statusData = data.reduce((acc, pedido) => {
    const status = pedido.situacao;
    const existingStatus = acc.find(item => item.name === status);
    if (existingStatus) {
      existingStatus.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);
  
  // ALTERADO: Cores atualizadas conforme sua solicitação
  const COLORS = {
    'Finalizado': '#008000',
    'Pendente': '#e36c09',
    'Cancelado': '#c00000',
    'Orçamento': '#000000',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
      <Card className="lg:col-span-4">
        <CardHeader><CardTitle>Pedidos por Mês</CardTitle></CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-3">
        <CardHeader><CardTitle>Status dos Pedidos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cccccc'} />))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} pedidos`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}