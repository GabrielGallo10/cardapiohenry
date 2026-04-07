export type PdfFinanceRow = {
  dateLabel: string;
  description: string;
  amountLabel: string;
  sourceLabel: string;
};

export async function downloadFinancePdf(params: {
  title: string;
  generatedAtLabel: string;
  entradas: PdfFinanceRow[];
  saidas: PdfFinanceRow[];
  totalEntradasLabel: string;
  totalSaidasLabel: string;
  saldoLabel: string;
  fileBaseName: string;
}): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const margin = 14;
  let y = 16;

  const tableBottom = (d: object) =>
    (d as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;

  doc.setFontSize(16);
  doc.text(params.title, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(params.generatedAtLabel, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  doc.setFontSize(11);
  doc.text("Entradas", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Data", "Descrição", "Origem", "Valor"]],
    body: params.entradas.map((r) => [
      r.dateLabel,
      r.description,
      r.sourceLabel,
      r.amountLabel,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: margin, right: margin },
  });

  y = tableBottom(doc) + 12;

  doc.setFontSize(11);
  doc.text("Saídas", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Data", "Descrição", "Origem", "Valor"]],
    body: params.saidas.map((r) => [
      r.dateLabel,
      r.description,
      r.sourceLabel,
      r.amountLabel,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [180, 83, 9] },
    margin: { left: margin, right: margin },
  });

  y = tableBottom(doc) + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total entradas: ${params.totalEntradasLabel}`, margin, y);
  y += 6;
  doc.text(`Total saídas: ${params.totalSaidasLabel}`, margin, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Saldo: ${params.saldoLabel}`, margin, y);

  doc.save(`${params.fileBaseName}.pdf`);
}
