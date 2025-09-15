// app/api/backup/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const fileBuffer = await fs.readFile(dbPath);

    // 1. Criar a assinatura (checksum) do arquivo de banco de dados
    const hash = createHash('sha256').update(fileBuffer).digest('hex');
    const signature = `GNS_PEDIDOS_BACKUP::${hash}`; // Assinatura = "ID_APP::CHECKSUM"

    // 2. Criar um novo buffer que contém [ASSINATURA] + [DADOS DO BANCO]
    const signatureBuffer = Buffer.from(signature, 'utf-8');
    const finalBuffer = Buffer.concat([signatureBuffer, fileBuffer]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-assinado-gns-${timestamp}.db`;

    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.append('Content-Type', 'application/x-sqlite3');

    return new NextResponse(finalBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Erro ao gerar backup:", error);
    return NextResponse.json({ error: 'Erro interno ao gerar backup.' }, { status: 500 });
  }
}