// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// PUT: Atualizar um usuário (só para admins)
export async function PUT(request, { params }) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { id } = params;
  try {
    const data = await request.json();
    const updateData = {
      email: data.email,
      vendedorPadrao: data.vendedorPadrao,
      role: data.role,
      status: data.status,
    };

    // Se uma nova senha for fornecida, cria um novo hash
    if (data.password) {
      updateData.senhaHash = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.Usuario.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    
    const { senhaHash: _, ...userToReturn } = updatedUser;
    return NextResponse.json(userToReturn);
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error);
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE: Deletar um usuário (só para admins)
export async function DELETE(request, { params }) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  
  const { id } = params;
  // Prevenção para não se deletar
  const session = await getServerSession(authOptions);
  if (session.user.id === parseInt(id)) {
    return NextResponse.json({ error: 'Você não pode deletar a si mesmo.' }, { status: 400 });
  }

  try {
    await prisma.Usuario.delete({ where: { id: parseInt(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar usuário ${id}:`, error);
    return NextResponse.json({ error: 'Erro ao deletar usuário' }, { status: 500 });
  }
}