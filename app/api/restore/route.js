// app/api/restore/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

export async function POST(request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || file.type !== 'application/x-sqlite3') {
      return NextResponse.json({ error: 'Arquivo inválido. Por favor, envie um arquivo .db válido.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Extrair a assinatura e os dados do banco do arquivo enviado
    // A assinatura tem um tamanho fixo (ID + :: + hash de 64 chars)
    const signatureIdentifier = 'GNS_PEDIDOS_BACKUP::';
    const signatureLength = signatureIdentifier.length + 64;
    
    const signatureBuffer = fileBuffer.slice(0, signatureLength);
    const dbBuffer = fileBuffer.slice(signatureLength);

    const signature = signatureBuffer.toString('utf-8');
    const [appName, checksum] = signature.split('::');

    // 2. Validar o identificador e a presença do checksum
    if (appName !== 'GNS_PEDIDOS_BACKUP' || !checksum) {
      throw new Error('Backup inválido ou não autenticado. Assinatura não encontrada.');
    }

    // 3. Recalcular o checksum dos dados do banco e comparar
    const hash = createHash('sha256').update(dbBuffer).digest('hex');
    if (hash !== checksum) {
      throw new Error('Falha na verificação de integridade. O backup pode estar corrompido ou foi modificado.');
    }

    // 4. Se tudo estiver OK, proceder com a restauração
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    await fs.writeFile(dbPath, dbBuffer);

    return NextResponse.json({ success: true, message: 'Backup autenticado e restaurado com sucesso! Você será desconectado.' });
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    return NextResponse.json({ error: error.message || 'Erro interno ao restaurar o backup.' }, { status: 500 });
  }
}