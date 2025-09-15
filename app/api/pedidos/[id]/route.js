// app/api/pedidos/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET: Busca um único pedido (sem alterações)
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

    // Mesmo no GET, é uma boa prática garantir que o usuário só veja o que pode
    if (session.user.role !== 'ADMIN' && pedido.vendedor !== session.user.vendedor) {
      return NextResponse.json({ error: 'Acesso negado a este pedido' }, { status: 403 });
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT: Atualiza um pedido com verificação de propriedade
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.vendedor) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await request.json();

    // 1. Buscar o pedido original primeiro
    const pedido = await prisma.Pedido.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    // 2. CORREÇÃO DE SEGURANÇA: Verificar se o usuário tem permissão para editar
    if (session.user.role !== 'ADMIN' && pedido.vendedor !== session.user.vendedor) {
      return NextResponse.json({ error: 'Você não tem permissão para editar este pedido.' }, { status: 403 });
    }
    
    // 3. Se a verificação passar, prosseguir com a atualização
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

// DELETE: Deleta um pedido com verificação de propriedade
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.vendedor) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const { id } = params;

    // 1. Buscar o pedido original primeiro
    const pedido = await prisma.Pedido.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    // 2. CORREÇÃO DE SEGURANÇA: Verificar se o usuário tem permissão para deletar
    if (session.user.role !== 'ADMIN' && pedido.vendedor !== session.user.vendedor) {
      return NextResponse.json({ error: 'Você não tem permissão para deletar este pedido.' }, { status: 403 });
    }

    // 3. Se a verificação passar, prosseguir com a exclusão
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