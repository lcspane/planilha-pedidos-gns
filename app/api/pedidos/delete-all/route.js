// app/api/pedidos/delete-all/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.vendedor) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'A senha é necessária para confirmar a exclusão.' }, { status: 400 });
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

    // 2. Deletar todos os pedidos do vendedor
    const result = await prisma.Pedido.deleteMany({
      where: {
        vendedor: session.user.vendedor,
      },
    });

    return NextResponse.json({ success: true, message: `Todos os seus ${result.count} pedidos foram excluídos permanentemente.` });
  } catch (error) {
    console.error("Erro ao deletar todos os pedidos:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}