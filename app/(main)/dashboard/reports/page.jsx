'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/pedidos/all');
        const pedidos = await response.json();
        
        const monthlyData = pedidos.reduce((acc, pedido) => {
          const month = new Date(pedido.data).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!acc[month]) {
            acc[month] = { month, total: 0 };
          }
          acc[month].total += pedido.valorTotal;
          return acc;
        }, {});

        // Ordenando os dados por data para garantir que o gráfico esteja em ordem cronológica
        const sortedData = Object.values(monthlyData).sort((a, b) => {
            const dateA = new Date(`01 ${a.month.replace(' de ', ' ')}`);
            const dateB = new Date(`01 ${b.month.replace(' de ', ' ')}`);
            return dateA - dateB;
        });

        setData(sortedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório Mensal de Vendas", 14, 16);
    autoTable(doc, {
      head: [['Mês', 'Total (R$)']],
      body: data.map(item => [item.month, item.total.toFixed(2)]),
    });
    doc.save('relatorio_vendas.pdf');
  };

  if (loading) {
    return <div className="p-4">Carregando dados do relatório...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
      <div className="mb-4">
        <button onClick={exportPDF} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Exportar para PDF
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Vendas Mensais</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total Vendido" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}