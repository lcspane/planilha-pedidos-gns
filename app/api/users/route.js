// app/api/users/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// Função para verificar se o usuário é ADMIN
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// GET: Listar todos os usuários (só para admins)
export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  
  const users = await prisma.Usuario.findMany({
    orderBy: { email: 'asc' },
  });
  // Remove o hash da senha antes de enviar para o frontend
  const usersWithoutPassword = users.map(({ senhaHash, ...user }) => user);
  return NextResponse.json(usersWithoutPassword);
}

// POST: Criar um novo usuário (só para admins)
export async function POST(request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const data = await request.json();
    if (!data.email || !data.password || !data.vendedorPadrao) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const senhaHash = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.Usuario.create({
      data: {
        email: data.email,
        senhaHash,
        vendedorPadrao: data.vendedorPadrao,
        role: data.role || 'USER',
        status: 'ATIVO',
      },
    });

    const { senhaHash: _, ...userToReturn } = newUser;
    return NextResponse.json(userToReturn, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') { // Erro de email duplicado
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
    }
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}