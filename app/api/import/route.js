// app/api/import/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Papa from 'papaparse';
import xss from 'xss';

const VALID_SITUACOES = ['ORÇAMENTO', 'PENDENTE', 'FINALIZADO', 'CANCELADO'];
const sanitizeString = (str) => { if (!str || typeof str !== 'string') return null; const cleanedString = str.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); return xss(cleanedString); };

// CORRIGIDO: A função agora assume o formato Dia/Mês/Ano (DD/MM/YYYY)
const parseBrazilianDate = (dateString) => {
  if (!dateString) return null;
  const cleanedDateString = dateString.trim();
  const parts = cleanedDateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado em JS
  let year = parseInt(parts[2], 10);

  if (year < 100) {
    year += 2000; // Converte anos de 2 dígitos como '25' para 2025
  }

  // Validação mais rigorosa
  const date = new Date(year, month, day);
  if (isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  return date;
};

const parseCurrency = (currencyString) => { if (!currencyString || typeof currencyString !== 'string') return 0; const numberString = currencyString.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(); return parseFloat(numberString) || 0; };

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.vendedor) { return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 }); }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mapping = JSON.parse(formData.get('mapping'));

    if (!file || !mapping) { return NextResponse.json({ error: 'Arquivo ou mapeamento de colunas ausente.' }, { status: 400 }); }

    const fileContent = await file.text();
    
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toUpperCase(),
      delimitersToGuess: [';', ','],
    });

    if (parsed.errors.length > 0 && parsed.errors.some(e => e.code === 'TooManyFields' || e.code === 'TooFewFields')) {
      return NextResponse.json({ error: 'Falha ao ler o arquivo. Verifique o delimitador (vírgula ou ponto e vírgula).' }, { status: 400 });
    }

    const pedidosParaCriar = [];
    const errors = [];
    let rowIndex = 1;

    for (const row of parsed.data) {
      rowIndex++;
      
      const situacao = row[mapping.situacao];
      const cliente = row[mapping.cliente];
      const dataStr = row[mapping.data];
      const valorStr = row[mapping.valorTotal];

      if (!situacao && !cliente && !dataStr && !valorStr) { continue; }
      if (!situacao || !cliente || !dataStr || !valorStr) {
        errors.push(`Erro na linha ${rowIndex}: Dados obrigatórios não mapeados ou vazios.`);
        continue;
      }
      
      const sanitizedSituacao = sanitizeString(situacao);
      if (!sanitizedSituacao || !VALID_SITUACOES.includes(sanitizedSituacao.toUpperCase())) {
        errors.push(`Erro na linha ${rowIndex}: Situação "${situacao}" é inválida.`);
        continue;
      }
      
      const dataPedido = parseBrazilianDate(dataStr);
      if (!dataPedido) {
        errors.push(`Erro na linha ${rowIndex}: Formato de data inválido ('${dataStr}'). Use o formato DD/MM/AAAA.`);
        continue;
      }
      
      const valorTotal = parseCurrency(valorStr);
      if (isNaN(valorTotal)) {
        errors.push(`Erro na linha ${rowIndex}: Formato de valor inválido ('${valorStr}').`);
        continue;
      }

      pedidosParaCriar.push({
        situacao: sanitizedSituacao.charAt(0).toUpperCase() + sanitizedSituacao.slice(1).toLowerCase(),
        data: dataPedido,
        cliente: sanitizeString(cliente).toUpperCase(),
        valorTotal: valorTotal,
        contato: sanitizeString(row[mapping.contato]),
        referencia: sanitizeString(row[mapping.referencia])?.toUpperCase(),
        vendedor: session.user.vendedor,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Seu arquivo contém erros.', details: errors }, { status: 400 });
    }
    if (pedidosParaCriar.length === 0) {
      return NextResponse.json({ error: 'Nenhum dado válido encontrado no arquivo CSV.' }, { status: 400 });
    }

    const result = await prisma.Pedido.createMany({
      data: pedidosParaCriar,
    });

    return NextResponse.json({ success: true, count: result.count, message: `${result.count} de ${pedidosParaCriar.length} pedidos foram importados com sucesso!` });
  } catch (error) {
    console.error("Erro ao importar CSV:", error);
    return NextResponse.json({ error: 'Erro interno do servidor ao processar o arquivo.' }, { status: 500 });
  }
}