// app/api/auth/verify-session/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

// O 'request' foi removido dos parâmetros
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session?.user?.sessionToken) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  try {
    const user = await prisma.Usuario.findUnique({
      where: { email: session.user.email },
      select: { sessionToken: true },
    });
    const isValid = user?.sessionToken === session.user.sessionToken;
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}