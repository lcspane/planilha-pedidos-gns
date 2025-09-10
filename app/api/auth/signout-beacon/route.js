// app/api/auth/signout-beacon/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(request) {
  try {
    // Usamos getToken para decodificar o token JWT da requisição
    const token = await getToken({ req: request, secret });

    if (token?.email) {
      // Invalida o token de sessão do usuário no banco de dados
      await prisma.Usuario.update({
        where: { email: token.email },
        data: { sessionToken: null }, // Limpa o token para invalidar a sessão
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no signout-beacon:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}