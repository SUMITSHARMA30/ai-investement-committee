"use client";

import { motion } from "framer-motion";
import { AgentReport } from "@/lib/types/agent";
import { StanceBadge } from "@/components/ui/StanceBadge";
import { ConfidenceMeter } from "@/components/ui/ConfidenceMeter";

export function AnalystCard({ report, index }: { report: AgentReport; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="glass-panel glass-panel-hover p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {report.agent}
        </h3>
        <StanceBadge stance={report.stance} />
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {report.summary}
      </p>

      <ul className="flex flex-col gap-1.5 mt-1">
        {report.keyPoints.map((point, i) => (
          <li key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: "var(--color-text-muted)" }}>
            <span style={{ color: "var(--color-accent)" }}>―</span>
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <ConfidenceMeter value={report.confidence} />
      </div>
    </motion.div>
  );
}
