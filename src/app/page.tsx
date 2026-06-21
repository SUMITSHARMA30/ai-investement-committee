"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import type { CommitteeRunResult } from "@/lib/agents/orchestrator";
import { sampleCommitteeResult } from "@/lib/mock/sampleCommitteeResult";
import { generateCommitteeReportPDF } from "@/lib/pdf/generateReport";
import { AnalystCard } from "@/components/committee/AnalystCard";
import { DecisionBanner } from "@/components/committee/DecisionBanner";
import { AgentWorkflowTimeline } from "@/components/committee/AgentWorkflowTimeline";
import { CommitteeVotePanel } from "@/components/committee/CommitteeVotePanel";
import { RiskPanel } from "@/components/committee/RiskPanel";
import { FinancialMetricsPanel } from "@/components/committee/FinancialMetricsPanel";

export default function Home() {
  const [result, setResult] = useState<CommitteeRunResult>(sampleCommitteeResult);
  const [tickerInput, setTickerInput] = useState("MSFT");
  const [isLoading, setIsLoading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleRunLive() {
    if (!tickerInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setActiveStage(1);

    const t1 = setTimeout(() => setActiveStage(2), 4000);
    const t2 = setTimeout(() => setActiveStage(3), 9000);
    const t3 = setTimeout(() => setActiveStage(4), 14000);

    try {
      const res = await fetch("/api/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: tickerInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details ?? data.error ?? "Unknown error");
      }

      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setActiveStage(0);
      setIsLoading(false);
    }
  }

  const analystEntries = [
    result.research,
    result.financial,
    result.news,
    result.bear,
    result.bull,
    result.risk,
  ];

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--color-text-muted)" }}>
            Institutional Analysis Platform
          </p>
          <h1 className="text-2xl font-bold mt-1">AI Investment Committee</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            placeholder="Company or ticker"
            className="glass-panel px-4 py-2.5 text-sm font-mono-data outline-none w-48"
            style={{ color: "var(--color-text-primary)" }}
          />
          <button
            onClick={handleRunLive}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-[14px] text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "var(--color-accent)", color: "#04141c" }}
          >
            {isLoading ? "Convening Committee..." : "Run Live Analysis"}
          </button>
          <button
            onClick={() => generateCommitteeReportPDF(result)}
            className="glass-panel glass-panel-hover px-4 py-2.5 rounded-[14px] text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div
          className="glass-panel px-4 py-3 text-sm border"
          style={{ color: "var(--color-bear)", borderColor: "var(--color-bear)" }}
        >
          {error}
        </div>
      )}

      <AgentWorkflowTimeline activeStage={activeStage} />

      <motion.div
        key={result.decision.generatedAt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        <DecisionBanner decision={result.decision} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <CommitteeVotePanel reports={analystEntries} voteTally={result.decision.voteTally} />
          <RiskPanel risk={result.risk} />
          <FinancialMetricsPanel financial={result.financial} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {analystEntries.map((report, i) => (
            <AnalystCard key={report.agent} report={report} index={i} />
          ))}
        </div>
      </motion.div>
    </main>
  );
}