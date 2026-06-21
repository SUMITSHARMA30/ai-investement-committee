"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { AgentReport } from "@/lib/types/agent";

function formatCurrency(value: number) {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value}`;
}

export function FinancialMetricsPanel({ financial }: { financial: AgentReport }) {
  const m = financial.metrics ?? {};

  const chartData = [
    { name: "Profit Margin", value: Number(m.profitMargin ?? 0) * 100 },
    { name: "Op. Margin", value: Number(m.operatingMargin ?? 0) * 100 },
    { name: "ROE", value: Number(m.returnOnEquity ?? 0) * 100 },
    { name: "Rev. Growth", value: Number(m.quarterlyRevenueGrowthYOY ?? 0) * 100 },
  ];

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Financial Metrics
      </p>

      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={{ stroke: "rgba(148,163,184,0.15)" }} tickLine={false} />
            <YAxis tick={{ fill: "#8b96a8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "#0c1019", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, fontSize: 12 }}
formatter={(value: any) => [
  `${Number(value ?? 0).toFixed(1)}%`,
  "Value",
]}            />
            <Bar dataKey="value" fill="#2dd4ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <Stat label="Market Cap" value={formatCurrency(Number(m.marketCap ?? 0))} />
        <Stat label="P/E Ratio" value={m.peRatio != null ? Number(m.peRatio).toFixed(1) : "N/A"} />
        <Stat label="Revenue (TTM)" value={formatCurrency(Number(m.revenueTTM ?? 0))} />
        <Stat label="Debt / Equity" value={m.debtToEquity != null ? Number(m.debtToEquity).toFixed(2) : "N/A"} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-mono-data" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  );
}