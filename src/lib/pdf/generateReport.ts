import { jsPDF } from "jspdf";
import type { CommitteeRunResult } from "@/lib/agents/orchestrator";
import type { AgentReport } from "@/lib/types/agent";

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  bg: [6, 8, 13],
  bull: [0, 153, 102],
  bear: [200, 30, 60],
  accent: [20, 130, 160],
  warning: [200, 130, 0],
};

function stanceColor(stance: string): number[] {
  if (stance === "bullish") return COLORS.bull;
  if (stance === "bearish") return COLORS.bear;
  return COLORS.accent;
}

export function generateCommitteeReportPDF(result: CommitteeRunResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function addSectionTitle(text: string) {
    checkPageBreak(30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(text.toUpperCase(), MARGIN, y);
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 18;
  }

  function addParagraph(text: string, size = 10) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    checkPageBreak(lines.length * (size + 4));
    doc.text(lines, MARGIN, y);
    y += lines.length * (size + 4) + 6;
  }

  function addBullet(text: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(`•  ${text}`, CONTENT_WIDTH - 10);
    checkPageBreak(lines.length * 13);
    doc.text(lines, MARGIN + 6, y);
    y += lines.length * 13 + 2;
  }

  function addAgentBlock(report: AgentReport) {
    checkPageBreak(70);
    doc.setFontSize(11.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(report.agent, MARGIN, y);

    const color = stanceColor(report.stance);
    doc.setFontSize(9);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${report.stance.toUpperCase()}  ·  ${report.confidence}% confidence`, MARGIN, y + 14);
    y += 30;

    addParagraph(report.summary, 10);
    for (const point of report.keyPoints) {
      addBullet(point);
    }
    y += 10;
  }

  // ---- Cover ----
  doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
  doc.rect(0, 0, PAGE_WIDTH, 140, "F");

  doc.setTextColor(150, 160, 175);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("INSTITUTIONAL ANALYSIS PLATFORM", MARGIN, 40);

  doc.setTextColor(240, 240, 245);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("AI Investment Committee Report", MARGIN, 70);

  doc.setFontSize(13);
  doc.setTextColor(60, 200, 230);
  doc.text(result.decision.ticker, MARGIN, 95);

  doc.setFontSize(9);
  doc.setTextColor(150, 160, 175);
  doc.text(`Generated ${new Date(result.decision.generatedAt).toLocaleString()}`, MARGIN, 115);

  y = 170;

  // ---- Final decision ----
  addSectionTitle("Final Decision");
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const decisionColor =
    result.decision.finalDecision === "INVEST"
      ? COLORS.bull
      : result.decision.finalDecision === "PASS"
      ? COLORS.bear
      : COLORS.warning;
  doc.setTextColor(decisionColor[0], decisionColor[1], decisionColor[2]);
  doc.text(result.decision.finalDecision, MARGIN, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Confidence: ${result.decision.confidenceScore}%   ·   Horizon: ${result.decision.investmentHorizon}`,
    MARGIN,
    y
  );
  y += 20;

  addParagraph(result.decision.rationale);

  if (result.decision.disagreementsResolved.length > 0) {
    y += 4;
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text("How Disagreements Were Resolved", MARGIN, y);
    y += 16;
    for (const item of result.decision.disagreementsResolved) {
      addBullet(item);
    }
  }

  y += 10;
  addSectionTitle("Committee Vote");
  addParagraph(
    `Bullish: ${result.decision.voteTally.bullish}   ·   Bearish: ${result.decision.voteTally.bearish}   ·   Neutral: ${result.decision.voteTally.neutral}`
  );

  // ---- Agent sections, page 2 ----
  doc.addPage();
  y = MARGIN;
  addSectionTitle("Research Analysis");
  addAgentBlock(result.research);

  addSectionTitle("Financial Analysis");
  addAgentBlock(result.financial);
  if (result.financial.metrics) {
    const m = result.financial.metrics;
    addParagraph(
      `Market Cap: ${m.marketCap ?? "N/A"}   P/E: ${m.peRatio ?? "N/A"}   Profit Margin: ${
        m.profitMargin ?? "N/A"
      }   Debt/Equity: ${m.debtToEquity ?? "N/A"}`,
      9
    );
  }

  addSectionTitle("News & Sentiment");
  addAgentBlock(result.news);

  // ---- Debate + risk, page 3 ----
  doc.addPage();
  y = MARGIN;
  addSectionTitle("Bear Case");
  addAgentBlock(result.bear);

  addSectionTitle("Bull Case");
  addAgentBlock(result.bull);

  addSectionTitle("Risk Assessment");
  addAgentBlock(result.risk);
  if (result.risk.metrics) {
    addParagraph(
      `Risk Score: ${result.risk.metrics.riskScore ?? "N/A"} / 100   Risk Level: ${
        result.risk.metrics.riskLevel ?? "N/A"
      }`,
      9
    );
  }

  // ---- Footer on every page ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`AI Investment Committee — ${result.decision.ticker}`, MARGIN, PAGE_HEIGHT - 24);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN - 60, PAGE_HEIGHT - 24);
  }

  doc.save(`AI-Investment-Committee-${result.decision.ticker}-${Date.now()}.pdf`);
}
