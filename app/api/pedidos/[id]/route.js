// app/api/pedidos/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const { id } = params;
    const pedido = await prisma.Pedido.findUnique({
      where: { id: parseInt(id) },
    });
    if (!pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const { id } = params;
    const data = await request.json();
    const pedidoAtualizado = await prisma.Pedido.update({
      where: {
        id: parseInt(id),
      },
      data: {
        situacao: data.situacao,
        contato: data.contato,
        data: new Date(data.data),
        cliente: data.cliente.toUpperCase(),
        referencia: data.referencia ? data.referencia.toUpperCase() : null,
        valorTotal: parseFloat(data.valorTotal),
        confirmado: data.confirmado,
        detalhes: data.detalhes,
        previsao: data.previsao ? new Date(data.previsao) : null,
        condPagamento: data.condPagamento,
        proximoContato: data.proximoContato ? new Date(data.proximoContato) : null,
      },
    });
    return NextResponse.json(pedidoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao atualizar pedido.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  try {
    const { id } = params;
    await prisma.Pedido.delete({
      where: {
        id: parseInt(id),
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao deletar pedido.' }, { status: 500 });
  }
}