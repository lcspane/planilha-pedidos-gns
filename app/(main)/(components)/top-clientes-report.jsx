// app/(main)/(components)/top-clientes-report.jsx
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatCurrency = (value) => {
    if (typeof value !== 'number') return "R$ 0,00";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function TopClientesReport({ data }) {
    const topClientes = useMemo(() => {
        const clientes = data.reduce((acc, pedido) => {
            if (pedido.situacao === 'Finalizado') {
                const cliente = pedido.cliente;
                const valor = pedido.valorTotal;
                acc[cliente] = (acc[cliente] || 0) + valor;
            }
            return acc;
        }, {});

        return Object.entries(clientes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, total]) => ({ name, total }));
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 5 Clientes (Confirmado)</CardTitle>
                <CardDescription>Clientes que mais geraram valor em pedidos finalizados.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topClientes.map((cliente) => (
                            <TableRow key={cliente.name}>
                                <TableCell>
                                    <div className="font-medium">{cliente.name}</div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(cliente.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}