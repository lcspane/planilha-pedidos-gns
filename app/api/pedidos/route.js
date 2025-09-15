// app/api/pedidos/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.vendedor) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // CORREÇÃO DEFINITIVA: A lógica de filtragem é aplicada aqui incondicionalmente.
  const whereClause = {
    vendedor: session.user.vendedor,
  };

  // Se o usuário logado for ADMIN, ele também verá apenas os seus próprios pedidos
  // nesta rota. A visão de "todos" fica na rota /api/pedidos/all.
  // Esta lógica garante que o dashboard principal do admin seja apenas o dele.

  try {
    const pedidos = await prisma.Pedido.findMany({
      where: whereClause,
      orderBy: {
        valorTotal: 'desc',
      },
    });
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar pedidos.' }, { status: 500 });
  }
}

// A função POST permanece a mesma
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const data = await request.json();
    if (!data.cliente || typeof data.valorTotal === 'undefined' || !data.data || !data.situacao) {
      return NextResponse.json({ error: 'Dados incompletos para criar o pedido.' }, { status: 400 });
    }
    const novoPedido = await prisma.Pedido.create({
      data: {
        situacao: data.situacao,
        contato: data.contato,
        data: new Date(data.data),
        cliente: data.cliente.toUpperCase(),
        referencia: data.referencia ? data.referencia.toUpperCase() : null,
        valorTotal: parseFloat(data.valorTotal),
        confirmado: data.confirmado,
        vendedor: session.user.vendedor,
        detalhes: data.detalhes,
        previsao: data.previsao ? new Date(data.previsao) : null,
        condPagamento: data.condPagamento,
        proximoContato: data.proximoContato ? new Date(data.proximoContato) : null,
      },
    });
    return NextResponse.json(novoPedido, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao criar pedido.' }, { status: 500 });
  }
}