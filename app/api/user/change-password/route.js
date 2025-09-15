// app/api/user/change-password/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  // 1. Proteger a rota e obter a sessão do usuário
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    // 2. Validação básica dos dados recebidos
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Dados inválidos. A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // 3. Buscar o usuário no banco de dados
    const user = await prisma.Usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // 4. Verificar se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.senhaHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'A senha atual está incorreta.' }, { status: 403 }); // 403 Forbidden
    }

    // 5. Criptografar a nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 6. Atualizar a senha no banco de dados
    await prisma.Usuario.update({
      where: { email: session.user.email },
      data: { senhaHash: newPasswordHash },
    });

    return NextResponse.json({ message: 'Senha alterada com sucesso!' });

  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}