// app/api/settings/maintenance/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// GET: Pega o status atual de manutenção
export async function GET() {
  if (!await isAdmin()) { return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); }
  
  let config = await prisma.AppConfig.findFirst();
  if (!config) { // Garante que sempre exista uma entrada de config
    config = await prisma.AppConfig.create({ data: {} });
  }
  return NextResponse.json(config);
}

// POST: Atualiza o status de manutenção
export async function POST(request) {
  if (!await isAdmin()) { return NextResponse.json({ error: 'Acesso negado' }, { status: 403 }); }
  
  try {
    const { maintenanceMode, maintenanceMessage } = await request.json();
    const config = await prisma.AppConfig.findFirst();
    const updatedConfig = await prisma.AppConfig.update({
      where: { id: config.id },
      data: { maintenanceMode, maintenanceMessage },
    });
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Erro ao atualizar modo de manutenção:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}