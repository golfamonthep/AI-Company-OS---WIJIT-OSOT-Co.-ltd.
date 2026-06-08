/**
 * reportGenerator.ts
 * Generates PDF and Excel reports from Meta Ads Insights data.
 * Uses:
 *   - PDFKit (pdfkit) for PDF generation
 *   - ExcelJS for Excel generation
 *   - storagePut() to upload to S3
 */

import ExcelJS from "exceljs";
import { storagePut } from "./storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyInsightRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  purchases: number;
  roas: number;
  cpm: number;
  cpc: number;
}

export interface ReportData {
  adAccountId: string;
  adAccountName: string;
  dateFrom: string;
  dateTo: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  totalPurchases: number;
  avgRoas: number;
  avgCpm: number;
  avgCpc: number;
  daily: DailyInsightRow[];
}

// ─── Meta API Fetcher ─────────────────────────────────────────────────────────

export async function fetchReportData(
  accessToken: string,
  adAccountId: string,
  days = 7
): Promise<ReportData> {
  const today = new Date();
  const since = new Date(today);
  since.setDate(today.getDate() - days);

  const sinceStr = since.toISOString().split("T")[0];
  const untilStr = today.toISOString().split("T")[0];

  const fields = [
    "campaign_id",
    "campaign_name",
    "spend",
    "impressions",
    "clicks",
    "cpm",
    "cpc",
    "cost_per_action_type",
    "purchase_roas",
    "actions",
  ].join(",");

  const url =
    `https://graph.facebook.com/v22.0/${adAccountId}/insights` +
    `?fields=${fields}` +
    `&time_range={"since":"${sinceStr}","until":"${untilStr}"}` +
    `&time_increment=1` +
    `&level=account` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  const json = (await res.json()) as {
    data?: Record<string, unknown>[];
    error?: { message: string };
  };

  if (json.error) throw new Error(`Meta API error: ${json.error.message}`);

  const daily: DailyInsightRow[] = (json.data ?? []).map((row) => {
    const spend = parseFloat((row.spend as string) ?? "0");
    const impressions = parseInt((row.impressions as string) ?? "0", 10);
    const clicks = parseInt((row.clicks as string) ?? "0", 10);
    const cpm = parseFloat((row.cpm as string) ?? "0");
    const cpc = parseFloat((row.cpc as string) ?? "0");

    // Extract leads from actions
    const actions = (row.actions as { action_type: string; value: string }[]) ?? [];
    const leads = actions
      .filter((a) => a.action_type === "lead")
      .reduce((s, a) => s + parseInt(a.value, 10), 0);

    // Extract purchases from actions
    const purchases = actions
      .filter((a) => a.action_type === "purchase" || a.action_type === "omni_purchase")
      .reduce((s, a) => s + parseInt(a.value, 10), 0);

    // ROAS from purchase_roas
    const purchaseRoasArr = (row.purchase_roas as { action_type: string; value: string }[]) ?? [];
    const roas = purchaseRoasArr.reduce((s, r) => s + parseFloat(r.value), 0);

    return {
      date: row.date_start as string ?? sinceStr,
      spend,
      impressions,
      clicks,
      leads,
      purchases,
      roas,
      cpm,
      cpc,
    };
  });

  // Sort by date ascending
  daily.sort((a, b) => a.date.localeCompare(b.date));

  const totalSpend = daily.reduce((s, d) => s + d.spend, 0);
  const totalImpressions = daily.reduce((s, d) => s + d.impressions, 0);
  const totalClicks = daily.reduce((s, d) => s + d.clicks, 0);
  const totalLeads = daily.reduce((s, d) => s + d.leads, 0);
  const totalPurchases = daily.reduce((s, d) => s + d.purchases, 0);
  const avgRoas = daily.length > 0 ? daily.reduce((s, d) => s + d.roas, 0) / daily.length : 0;
  const avgCpm = daily.length > 0 ? daily.reduce((s, d) => s + d.cpm, 0) / daily.length : 0;
  const avgCpc = daily.length > 0 ? daily.reduce((s, d) => s + d.cpc, 0) / daily.length : 0;

  return {
    adAccountId,
    adAccountName: adAccountId,
    dateFrom: sinceStr,
    dateTo: untilStr,
    totalSpend,
    totalImpressions,
    totalClicks,
    totalLeads,
    totalPurchases,
    avgRoas,
    avgCpm,
    avgCpc,
    daily,
  };
}

// ─── Excel Generator ──────────────────────────────────────────────────────────

export async function generateExcelReport(
  data: ReportData,
  userId: number
): Promise<{ key: string; url: string }> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AI Facebook Ads Guide";
  workbook.created = new Date();

  // ── Summary Sheet ──────────────────────────────────────────────────────────
  const summarySheet = workbook.addWorksheet("Summary");

  // Title
  summarySheet.mergeCells("A1:H1");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = `Facebook Ads Report — ${data.adAccountName}`;
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1877F2" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  summarySheet.getRow(1).height = 36;

  // Date range
  summarySheet.mergeCells("A2:H2");
  const dateCell = summarySheet.getCell("A2");
  dateCell.value = `Period: ${data.dateFrom} to ${data.dateTo}`;
  dateCell.font = { italic: true, color: { argb: "FF666666" } };
  dateCell.alignment = { horizontal: "center" };

  summarySheet.addRow([]);

  // KPI headers
  const kpiHeaders = ["Metric", "Value"];
  const kpiHeaderRow = summarySheet.addRow(kpiHeaders);
  kpiHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF42526E" } };
    cell.alignment = { horizontal: "center" };
  });

  const kpiRows = [
    ["Total Spend (฿)", data.totalSpend.toFixed(2)],
    ["Total Impressions", data.totalImpressions.toLocaleString()],
    ["Total Clicks", data.totalClicks.toLocaleString()],
    ["Total Leads", data.totalLeads.toLocaleString()],
    ["Total Purchases", data.totalPurchases.toLocaleString()],
    ["Average ROAS", data.avgRoas.toFixed(2) + "x"],
    ["Average CPM (฿)", data.avgCpm.toFixed(2)],
    ["Average CPC (฿)", data.avgCpc.toFixed(2)],
  ];

  kpiRows.forEach((row, i) => {
    const r = summarySheet.addRow(row);
    if (i % 2 === 0) {
      r.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4FF" } };
      });
    }
  });

  summarySheet.getColumn(1).width = 28;
  summarySheet.getColumn(2).width = 20;

  // ── Daily Breakdown Sheet ──────────────────────────────────────────────────
  const dailySheet = workbook.addWorksheet("Daily Breakdown");

  const dailyHeaders = ["Date", "Spend (฿)", "Impressions", "Clicks", "Leads", "Purchases", "ROAS", "CPM (฿)", "CPC (฿)"];
  const dailyHeaderRow = dailySheet.addRow(dailyHeaders);
  dailyHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1877F2" } };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  data.daily.forEach((row, i) => {
    const r = dailySheet.addRow([
      row.date,
      parseFloat(row.spend.toFixed(2)),
      row.impressions,
      row.clicks,
      row.leads,
      row.purchases,
      parseFloat(row.roas.toFixed(2)),
      parseFloat(row.cpm.toFixed(2)),
      parseFloat(row.cpc.toFixed(2)),
    ]);
    if (i % 2 === 0) {
      r.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFF" } };
      });
    }
  });

  // Totals row
  const totalsRow = dailySheet.addRow([
    "TOTAL",
    parseFloat(data.totalSpend.toFixed(2)),
    data.totalImpressions,
    data.totalClicks,
    data.totalLeads,
    data.totalPurchases,
    parseFloat(data.avgRoas.toFixed(2)),
    parseFloat(data.avgCpm.toFixed(2)),
    parseFloat(data.avgCpc.toFixed(2)),
  ]);
  totalsRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD700" } };
  });

  const colWidths = [14, 14, 16, 12, 10, 12, 10, 12, 12];
  colWidths.forEach((w, i) => {
    dailySheet.getColumn(i + 1).width = w;
  });

  // ── Export to buffer ───────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `report_${userId}_${data.dateFrom}_${data.dateTo}.xlsx`;
  const { key, url } = await storagePut(
    `reports/${userId}/${fileName}`,
    Buffer.from(buffer),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  return { key, url };
}

// ─── PDF Generator (HTML-based via string template) ───────────────────────────

export async function generatePdfReport(
  data: ReportData,
  userId: number
): Promise<{ key: string; url: string }> {
  // Build HTML report then convert to PDF using built-in weasyprint
  const htmlContent = buildPdfHtml(data);

  // Write to temp file and convert
  const { execSync } = await import("child_process");
  const { writeFileSync, readFileSync, unlinkSync } = await import("fs");
  const tmpHtml = `/tmp/report_${userId}_${Date.now()}.html`;
  const tmpPdf = tmpHtml.replace(".html", ".pdf");

  writeFileSync(tmpHtml, htmlContent, "utf-8");

  try {
    execSync(`manus-md-to-pdf /dev/null /dev/null 2>/dev/null || true`);
    // Use weasyprint directly
    execSync(`python3 -c "import weasyprint; weasyprint.HTML(filename='${tmpHtml}').write_pdf('${tmpPdf}')"`, {
      timeout: 30000,
    });
  } catch {
    // Fallback: use html to pdf via puppeteer-like approach or just return HTML as PDF placeholder
    // For now we'll use a simple approach with reportlab via python
    const pythonScript = buildPythonPdfScript(data, tmpPdf);
    const scriptPath = `/tmp/gen_report_${userId}.py`;
    writeFileSync(scriptPath, pythonScript, "utf-8");
    execSync(`python3 ${scriptPath}`, { timeout: 30000 });
    try { unlinkSync(scriptPath); } catch { /* ignore */ }
  }

  try { unlinkSync(tmpHtml); } catch { /* ignore */ }

  const pdfBuffer = readFileSync(tmpPdf);
  try { unlinkSync(tmpPdf); } catch { /* ignore */ }

  const fileName = `report_${userId}_${data.dateFrom}_${data.dateTo}.pdf`;
  const { key, url } = await storagePut(
    `reports/${userId}/${fileName}`,
    pdfBuffer,
    "application/pdf"
  );

  return { key, url };
}

function buildPdfHtml(data: ReportData): string {
  const kpiCards = [
    { label: "Total Spend", value: `฿${data.totalSpend.toFixed(2)}`, color: "#1877F2" },
    { label: "Impressions", value: data.totalImpressions.toLocaleString(), color: "#42526E" },
    { label: "Clicks", value: data.totalClicks.toLocaleString(), color: "#36B37E" },
    { label: "Leads", value: data.totalLeads.toLocaleString(), color: "#FF8B00" },
    { label: "Purchases", value: data.totalPurchases.toLocaleString(), color: "#DE350B" },
    { label: "Avg ROAS", value: `${data.avgRoas.toFixed(2)}x`, color: "#6554C0" },
    { label: "Avg CPM", value: `฿${data.avgCpm.toFixed(2)}`, color: "#00B8D9" },
    { label: "Avg CPC", value: `฿${data.avgCpc.toFixed(2)}`, color: "#57D9A3" },
  ];

  const kpiHtml = kpiCards.map(k => `
    <div style="background:${k.color};color:#fff;padding:12px 16px;border-radius:8px;text-align:center;margin:4px;">
      <div style="font-size:11px;opacity:0.85;">${k.label}</div>
      <div style="font-size:20px;font-weight:bold;">${k.value}</div>
    </div>
  `).join("");

  const dailyRows = data.daily.map((row, i) => `
    <tr style="background:${i % 2 === 0 ? "#f8faff" : "#fff"}">
      <td>${row.date}</td>
      <td>฿${row.spend.toFixed(2)}</td>
      <td>${row.impressions.toLocaleString()}</td>
      <td>${row.clicks.toLocaleString()}</td>
      <td>${row.leads}</td>
      <td>${row.purchases}</td>
      <td>${row.roas.toFixed(2)}x</td>
      <td>฿${row.cpm.toFixed(2)}</td>
      <td>฿${row.cpc.toFixed(2)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #333; }
  h1 { color: #1877F2; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #1877F2; color: #fff; padding: 8px; text-align: center; }
  td { padding: 7px 8px; text-align: center; border-bottom: 1px solid #eee; }
  .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
</style>
</head>
<body>
  <h1>Facebook Ads Report</h1>
  <div class="subtitle">Ad Account: ${data.adAccountName} &nbsp;|&nbsp; Period: ${data.dateFrom} to ${data.dateTo}</div>
  <div class="kpi-grid">${kpiHtml}</div>
  <h2 style="font-size:14px;color:#42526E;">Daily Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Spend (฿)</th><th>Impressions</th><th>Clicks</th>
        <th>Leads</th><th>Purchases</th><th>ROAS</th><th>CPM (฿)</th><th>CPC (฿)</th>
      </tr>
    </thead>
    <tbody>${dailyRows}</tbody>
    <tfoot>
      <tr style="background:#FFD700;font-weight:bold;">
        <td>TOTAL</td>
        <td>฿${data.totalSpend.toFixed(2)}</td>
        <td>${data.totalImpressions.toLocaleString()}</td>
        <td>${data.totalClicks.toLocaleString()}</td>
        <td>${data.totalLeads}</td>
        <td>${data.totalPurchases}</td>
        <td>${data.avgRoas.toFixed(2)}x</td>
        <td>฿${data.avgCpm.toFixed(2)}</td>
        <td>฿${data.avgCpc.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">Generated by AI Facebook Ads Guide &bull; ${new Date().toLocaleString("th-TH")}</div>
</body>
</html>`;
}

function buildPythonPdfScript(data: ReportData, outputPath: string): string {
  const rows = data.daily.map(r =>
    `[${JSON.stringify(r.date)}, "฿${r.spend.toFixed(2)}", "${r.impressions}", "${r.clicks}", "${r.leads}", "${r.purchases}", "${r.roas.toFixed(2)}x", "฿${r.cpm.toFixed(2)}", "฿${r.cpc.toFixed(2)}"]`
  ).join(",\n    ");

  return `
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

doc = SimpleDocTemplate("${outputPath}", pagesize=landscape(A4), leftMargin=1.5*cm, rightMargin=1.5*cm, topMargin=1.5*cm, bottomMargin=1.5*cm)
styles = getSampleStyleSheet()
story = []

# Title
title_style = ParagraphStyle('title', fontSize=18, textColor=colors.HexColor('#1877F2'), spaceAfter=4, alignment=TA_LEFT)
story.append(Paragraph("Facebook Ads Report", title_style))
sub_style = ParagraphStyle('sub', fontSize=10, textColor=colors.grey, spaceAfter=16)
story.append(Paragraph("Ad Account: ${data.adAccountName}  |  Period: ${data.dateFrom} to ${data.dateTo}", sub_style))

# KPI table
kpi_data = [
    ["Total Spend", "Impressions", "Clicks", "Leads", "Purchases", "Avg ROAS", "Avg CPM", "Avg CPC"],
    ["฿${data.totalSpend.toFixed(2)}", "${data.totalImpressions}", "${data.totalClicks}", "${data.totalLeads}", "${data.totalPurchases}", "${data.avgRoas.toFixed(2)}x", "฿${data.avgCpm.toFixed(2)}", "฿${data.avgCpc.toFixed(2)}"],
]
kpi_table = Table(kpi_data, colWidths=[3.5*cm]*8)
kpi_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1877F2')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#EBF3FF')),
    ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#EBF3FF')]),
    ('BOX', (0,0), (-1,-1), 0.5, colors.grey),
    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.lightgrey),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
]))
story.append(kpi_table)
story.append(Spacer(1, 0.5*cm))

# Daily breakdown
headers = ["Date", "Spend (฿)", "Impressions", "Clicks", "Leads", "Purchases", "ROAS", "CPM (฿)", "CPC (฿)"]
daily_rows = [
    ${rows}
]
all_rows = [headers] + daily_rows + [["TOTAL", "฿${data.totalSpend.toFixed(2)}", "${data.totalImpressions}", "${data.totalClicks}", "${data.totalLeads}", "${data.totalPurchases}", "${data.avgRoas.toFixed(2)}x", "฿${data.avgCpm.toFixed(2)}", "฿${data.avgCpc.toFixed(2)}"]]

daily_table = Table(all_rows, colWidths=[2.8*cm, 2.8*cm, 2.8*cm, 2.4*cm, 2.2*cm, 2.8*cm, 2.2*cm, 2.8*cm, 2.8*cm])
style = [
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1877F2')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 8),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BOX', (0,0), (-1,-1), 0.5, colors.grey),
    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.lightgrey),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#FFD700')),
    ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
]
for i in range(1, len(all_rows)-1):
    if i % 2 == 0:
        style.append(('BACKGROUND', (0,i), (-1,i), colors.HexColor('#F8FAFF')))
daily_table.setStyle(TableStyle(style))
story.append(daily_table)

doc.build(story)
print("PDF generated: ${outputPath}")
`;
}
