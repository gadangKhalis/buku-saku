import PDFDocument from "pdfkit";
import { Response } from "wxpress";

interface Transaction {
  date: string;
  description: string | null;
  category: { name: string };
  type: string;
  amountInIDR: number;
}

interface PdfReportData {
  userName: string;
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export const generatePdfReport = (data: PdfReportData, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=laporan-${data.month}.pdf`,
  );
  doc.pipe(res);

  // HEADER
  doc.fontSize(20).font("Helvetica-Bold").text("BUkuSaku", 50, 50);
  doc.fontSize(12).font("Helvetica").text("Expense Report", 50, 75);
  doc.fontSize(10).text(`Period: ${data.month}`, 50, 92);
  doc.fontSize(10).text(`Name: ${data.userName}`, 50, 100);

  doc.moveTo(50, 125).lineTo(545, 125).stroke();

  // SUMMARY Card
  doc.fontSize(11).font("Helvetica-Bold").text("Summary", 50, 140);

  doc.fontSize(10).font("Helvetica");
  doc.text(`Income  : ${formatIDR(data.totalIncome)}`, 50, 160);
  doc.text(`Expense : ${formatIDR(data.totalExpense)}`, 50, 176);
  doc.text(`Balance : ${formatIDR(data.balance)}`, 50, 192);

  doc.moveTo(50, 210).lineTo(545, 210).stroke();

  //   table header
  doc.fontSize(11).font("Helvetica-Bold").text("Detail Transaction", 50, 220);

  const tableTop = 240;
  doc.fontSize(9).font("Helvetica-Bold");
  doc.text("Date", 50, tableTop);
  doc.text("Description", 130, tableTop);
  doc.text("Catefory", 300, tableTop);
  doc.text("Type", 390, tableTop);
  doc.text("Total", 450, tableTop, { width: 95, align: "right" });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .stroke();

  let y = tableTop + 25;
  doc.fontSize(9).font("Helvetica");

  data.transactions.forEach((trx) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    const date = new Date(trx.date).toLocaleDateString("id-ID");
    const desc = trx.description ?? "-";
    const category = trx.category.name;
    const type = trx.type === "INCOME" ? "Masuk" : "Keluar";
    const amount = formatIDR(trx.amountInIDR);

    doc.text(date, 50, y);
    doc.text(desc.substring(0, 20), 130, y); // max 20 karakter
    doc.text(category.substring(0, 15), 300, y); // max 15 karakter
    doc.text(type, 390, y);
    doc.text(amount, 450, y, { width: 95, align: "right" });

    y += 20;
  });

  doc.moveTo(50, y).lineTo(545, y).stroke();

  //   Footer
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(`Generated at ${new Date().toLocaleDateString("id-ID")}`, 50, y + 15);

  doc.end();
};
