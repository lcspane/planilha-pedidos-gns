// app/api/pedidos/delete-by-month/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.vendedor) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { month, year, password } = await request.json();

    if (!month || !year || !password) {
      return NextResponse.json({ error: 'Dados incompletos para a exclusão.' }, { status: 400 });
    }

    // 1. Verificar a senha do usuário
    const user = await prisma.Usuario.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.senhaHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 403 });
    }

    // 2. Definir o intervalo de datas para o mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Último dia do mês

    // 3. Deletar os pedidos
    const result = await prisma.Pedido.deleteMany({
      where: {
        vendedor: session.user.vendedor,
        data: {
          gte: startDate, // Maior ou igual a
          lte: endDate,   // Menor ou igual a
        },
      },
    });

    return NextResponse.json({ success: true, message: `${result.count} pedidos do mês selecionado foram excluídos.` });
  } catch (error) {
    console.error("Erro ao deletar pedidos por mês:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}