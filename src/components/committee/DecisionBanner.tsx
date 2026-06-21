"use client";

import { motion } from "framer-motion";
import { PortfolioManagerDecision } from "@/lib/types/decision";

const DECISION_STYLES: Record<string, { color: string; glow: string }> = {
  INVEST: { color: "var(--color-bull)", glow: "rgba(0, 214, 143, 0.12)" },
  HOLD: { color: "var(--color-warning)", glow: "rgba(255, 176, 32, 0.12)" },
  PASS: { color: "var(--color-bear)", glow: "rgba(255, 77, 106, 0.12)" },
};

export function DecisionBanner({ decision }: { decision: PortfolioManagerDecision }) {
  const style = DECISION_STYLES[decision.finalDecision] ?? DECISION_STYLES.HOLD;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel p-6 md:p-8"
      style={{ boxShadow: `0 0 0 1px ${style.color}22, 0 12px 40px ${style.glow}` }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--color-text-muted)" }}>
            Committee Final Decision — {decision.ticker}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-mono-data" style={{ color: style.color }}>
            {decision.finalDecision}
          </h2>
          <p className="text-sm mt-3 max-w-2xl leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {decision.rationale}
          </p>
        </div>

        <div className="flex md:flex-col gap-6 md:gap-3 md:text-right shrink-0">
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Confidence
            </p>
            <p className="text-2xl font-mono-data font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {decision.confidenceScore}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Horizon
            </p>
            <p className="text-sm font-mono-data" style={{ color: "var(--color-text-primary)" }}>
              {decision.investmentHorizon}
            </p>
          </div>
        </div>
      </div>

      {decision.disagreementsResolved.length > 0 && (
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
            How disagreements were resolved
          </p>
          <ul className="flex flex-col gap-2">
            {decision.disagreementsResolved.map((item, i) => (
              <li key={i} className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}