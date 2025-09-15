// app/api/pedidos/all/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Esta rota é estritamente para ADMINs
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    // Busca TODOS os pedidos, sem filtro de vendedor
    const pedidos = await prisma.Pedido.findMany({
      orderBy: {
        valorTotal: 'desc',
      },
    });
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos (admin):", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}