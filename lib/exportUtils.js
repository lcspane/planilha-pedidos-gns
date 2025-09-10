// lib/exportUtils.js
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const prepareDataForExport = (data) => {
  return data.map(pedido => ({
    'Situação': pedido.situacao,
    'Contato': pedido.contato || '-',
    'Data': format(new Date(pedido.data), 'dd/MM/yyyy'),
    'Cliente': pedido.cliente,
    'Referência': pedido.referencia || '-',
    'Valor Total': pedido.valorTotal,
  }));
};

// 1. Lógica para exportar para Excel (.xlsx) - VERSÃO CORRIGIDA E FINAL
export const exportToExcel = (data, fileName) => {
  const formattedData = data.map(pedido => ({
    'Situação': pedido.situacao,
    'Contato': pedido.contato || '-',
    'Data': new Date(pedido.data),
    'Cliente': pedido.cliente,
    'Referência': pedido.referencia || '-',
    'Valor Total': pedido.valorTotal,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const headerStyle = {
    font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2F3640" } },
    alignment: { vertical: "center", horizontal: "center" }
  };
  
  const statusFontStyles = {
    Finalizado: { color: { rgb: "006100" }, bold: true },
    Cancelado: { color: { rgb: "9C0006" }, bold: true },
    Pendente: { color: { rgb: "9C5700" }, bold: true },
    Orçamento: { color: { rgb: "000000" }, bold: false },
  };

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Aplica o estilo ao cabeçalho
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ c: C, r: range.s.r });
    if (worksheet[address]) {
      worksheet[address].s = headerStyle;
    }
  }

  // Aplica os estilos às células de dados
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const situacaoCellAddress = XLSX.utils.encode_cell({ c: 0, r: R });
    const situacao = worksheet[situacaoCellAddress]?.v;
    const fontStyle = statusFontStyles[situacao] || statusFontStyles['Orçamento'];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
      if (!worksheet[cellAddress]) continue;

      // Cria um objeto de estilo final para cada célula
      const finalStyle = {
        font: fontStyle, // Aplica o estilo da fonte (cor/negrito)
        alignment: { vertical: "center" }
      };

      if (C === 2) { // Coluna Data
        finalStyle.numFmt = 'dd/mm/yyyy';
      }
      if (C === 5) { // Coluna Valor Total
        finalStyle.numFmt = 'R$ #,##0.00';
      }
      
      worksheet[cellAddress].s = finalStyle;
    }
  }

  worksheet['!cols'] = [ { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 45 }, { wch: 20 }, { wch: 18 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};


// 2. Lógica para exportar para CSV (.csv)
export const exportToCSV = (data, fileName) => {
  const formattedData = prepareDataForExport(data);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([`\uFEFF${csvOutput}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


// 3. Lógica para exportar para PDF (.pdf) com Estilos
export const exportToPDF = (data, fileName) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const formattedData = prepareDataForExport(data);
  const tableColumn = Object.keys(formattedData[0]);
  const tableRows = formattedData.map(item => Object.values(item));

  const statusStyles = {
    Finalizado: { textColor: [0, 128, 0], fontStyle: 'bold' },
    Cancelado: { textColor: [192, 0, 0], fontStyle: 'bold' },
    Pendente: { textColor: [227, 108, 9], fontStyle: 'bold' },
    Orçamento: { textColor: [0, 0, 0], fontStyle: 'normal' },
  };

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    headStyles: { fillColor: [34, 47, 62], textColor: 255, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: { 5: { halign: 'right' } },
    didParseCell: function (data) {
        if (data.column.index === 5 && data.cell.section === 'body') {
            const value = data.cell.raw;
            if (typeof value === 'number') {
                data.cell.text = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }
        }
    },
    willDrawCell: function (data) {
      if (data.section === 'body') {
        const situacao = data.row.raw[0];
        const style = statusStyles[situacao] || statusStyles['Orçamento'];
        doc.setFont(undefined, style.fontStyle);
        doc.setTextColor.apply(doc, style.textColor);
      }
    },
    didDrawPage: function (data) {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('GNS Pedidos - Relatório Interno', data.settings.margin.left, doc.internal.pageSize.height - 8);
      doc.text('Página ' + doc.internal.getCurrentPageInfo().pageNumber + ' de ' + pageCount, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 8, { align: 'right' });
    }
  });

  const pageTitle = `Relatório de Pedidos - ${fileName.replace('pedidos_', '').replace(/_/g, '/')}`;
  doc.setFontSize(16);
  doc.text(pageTitle, 14, 15);
  doc.save(`${fileName}.pdf`);
};