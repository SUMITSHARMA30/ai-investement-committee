"use client";

import { AgentReport } from "@/lib/types/agent";
import { RiskGauge } from "./RiskGauge";

export function RiskPanel({ risk }: { risk: AgentReport }) {
  const score = Number(risk.metrics?.riskScore ?? 0);
  const level = String(risk.metrics?.riskLevel ?? "Unknown");

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Risk Assessment
      </p>

      <RiskGauge score={score} level={level} />

      <ul className="flex flex-col gap-1.5 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        {risk.keyPoints.map((point, i) => (
          <li key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: "var(--color-text-muted)" }}>
            <span style={{ color: "var(--color-warning)" }}>!</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
