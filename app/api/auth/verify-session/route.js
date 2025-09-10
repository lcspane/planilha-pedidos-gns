// app/api/auth/verify-session/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session?.user?.sessionToken) {
    // Se não há sessão, o usuário já está efetivamente deslogado.
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const user = await prisma.Usuario.findUnique({
      where: { email: session.user.email },
      select: { sessionToken: true },
    });

    // Se o usuário não for encontrado no DB (caso raro), a sessão é inválida.
    if (!user) {
      return NextResponse.json({ valid: false });
    }

    // A verificação principal: o token da sessão do navegador é o mesmo do banco?
    const isValid = user.sessionToken === session.user.sessionToken;
    return NextResponse.json({ valid: isValid });

  } catch (error) {
    // CORREÇÃO: Se ocorrer um erro de banco de dados (ex: pool de conexão esgotado),
    // retornamos um erro de servidor (500), e não um 'valid: false'.
    console.error("Erro de servidor ao verificar sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao verificar a sessão." },
      { status: 500 }
    );
  }
}