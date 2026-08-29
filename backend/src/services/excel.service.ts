import ExcelJS from "exceljs";
import { Response } from "express";

interface Transaction {
  date: string;
  description: string | null;
  category: { name: string };
  type: string;
  amountInIDR: number;
}

interface ExcelReportData {
  userName: string;
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}

export const generateExcelReport = async (
  data: ExcelReportData,
  res: Response,
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BukuSaku";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("SUmmary");

  summarySheet.columns = [
    { header: "", key: "label", width: 20 },
    { header: "", key: "value", width: 25 },
  ];

  summarySheet.addRow({ label: "BukuSaku - Expense Report" });
  summarySheet.addRow({ label: "Name", value: data.userName });
  summarySheet.addRow({ label: "Period", value: data.month });
  summarySheet.addRow({});
  summarySheet.addRow({ label: "Income", value: data.totalIncome });
  summarySheet.addRow({ label: "Expense", value: data.totalExpense });
  summarySheet.addRow({ label: "Balance", value: data.balance });

  ["A5", "A6", "A7"].forEach((_, i) => {
    const cell = summarySheet.getCell(`B${5 + 1}`);
    cell.numFmt = "#, ##0";
  });

  summarySheet.getCell("A1").font = { bold: true, size: 14 };
  summarySheet.getCell("A5").font = { bold: true };
  summarySheet.getCell("A6").font = { bold: true };
  summarySheet.getCell("A7").font = { bold: true };

  const detailSheet = workbook.addWorksheet("Detail Transaction");

  detailSheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Description", key: "description", width: 25 },
    { header: "Category", key: "category", width: 20 },
    { header: "Type", key: "type", width: 12 },
    { header: "Total(IDR)", key: "amount", width: 18 },
  ];

  detailSheet.getRow(1).font = { bold: true };
  detailSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  detailSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  data.transactions.forEach((trx, index) => {
    const row = detailSheet.addRow({
      date: new Date(trx.date).toLocaleDateString("id-ID"),
      description: trx.description ?? "-",
      category: trx.category.name,
      type: trx.type === "INCOME" ? "Income" : "Expense",
      amount: trx.amountInIDR,
    });

    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF1F5F9" },
      };
    }

    row.getCell("amount").numFmt = "#,##0";

    row.getCell("type").font = {
      color: {
        argb: trx.type === "INCOME" ? "FF16A34A" : "FFDC2626",
      },
    };
  });

  //   Set Response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=laporan-${data.month}.xlsx`,
  );

  await workbook.xlsx.write(res);
  res.end();
};
