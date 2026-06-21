"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  phase: number; // 1: Fact Gathering, 2: Debate, 3: Risk, 4: Decision
}

const STEPS: Step[] = [
  { id: 1, label: "Research Analyst is gathering company information...", phase: 1 },
  { id: 2, label: "Financial Analyst is reviewing fundamentals...", phase: 1 },
  { id: 3, label: "News Analyst is analyzing recent developments...", phase: 1 },
  { id: 4, label: "Bull Analyst is preparing investment arguments...", phase: 2 },
  { id: 5, label: "Bear Analyst is reviewing risks...", phase: 2 },
  { id: 6, label: "Risk Officer is evaluating downside exposure...", phase: 3 },
  { id: 7, label: "Portfolio Manager is making a decision...", phase: 4 },
];

export function LiveProgress({ activeStage = 1 }: { activeStage: number }) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 max-w-xl mx-auto w-full border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-semibold tracking-wide text-[var(--color-accent)]">
          CONVENING INVESTMENT COMMITTEE
        </h3>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
          <span className="text-[10px] font-mono-data uppercase tracking-wider text-slate-400">
            Deliberating
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2">
        {STEPS.map((step) => {
          let status: "pending" | "active" | "completed" = "pending";

          if (activeStage > step.phase) {
            status = "completed";
          } else if (activeStage === step.phase) {
            status = "active";
          }

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="relative flex items-center justify-center shrink-0">
                {status === "completed" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-[var(--color-bull)]/20 border border-[var(--color-bull)] flex items-center justify-center text-[var(--color-bull)]"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </motion.div>
                )}

                {status === "active" && (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-5 h-5 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40"
                    />
                    <Loader2 className="w-3 h-3 animate-spin text-[var(--color-accent)] z-10" />
                  </div>
                )}

                {status === "pending" && (
                  <div className="w-5 h-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  </div>
                )}
              </div>

              <span
                className={`text-xs transition-colors duration-300 ${
                  status === "completed"
                    ? "text-slate-400"
                    : status === "active"
                    ? "text-[var(--color-text-primary)] font-medium"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
