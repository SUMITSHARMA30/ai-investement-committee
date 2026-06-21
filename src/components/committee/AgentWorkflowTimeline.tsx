"use client";

import { motion } from "framer-motion";

interface Stage {
  id: number;
  label: string;
  agents: string;
}

const STAGES: Stage[] = [
  { id: 1, label: "Fact Gathering", agents: "Research · Financial · News" },
  { id: 2, label: "Debate", agents: "Bear · Bull" },
  { id: 3, label: "Risk Assessment", agents: "Risk Officer" },
  { id: 4, label: "Final Decision", agents: "Portfolio Manager" },
];

export function AgentWorkflowTimeline({ activeStage = 0 }: { activeStage?: number }) {
  return (
    <div className="glass-panel p-6">
      <p className="text-xs uppercase tracking-wider mb-5" style={{ color: "var(--color-text-muted)" }}>
        Committee Workflow
      </p>
      <div className="flex items-start">
        {STAGES.map((stage, i) => {
          const isActive = activeStage === stage.id;
          const isDone = activeStage === 0 || activeStage > stage.id;
          return (
            <div key={stage.id} className="flex items-start flex-1 last:flex-initial">
              <div className="flex flex-col items-center" style={{ minWidth: 110 }}>
                <motion.div
                  animate={{ scale: isActive ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono-data text-xs"
                  style={{
                    borderColor: isDone || isActive ? "var(--color-accent)" : "var(--color-border)",
                    color: isDone || isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                    backgroundColor: isDone || isActive ? "rgba(45, 212, 255, 0.08)" : "transparent",
                  }}
                >
                  {stage.id}
                </motion.div>
                <p
                  className="text-xs mt-2 text-center font-medium"
                  style={{ color: isDone || isActive ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                >
                  {stage.label}
                </p>
                <p className="text-[10px] mt-1 text-center leading-tight" style={{ color: "var(--color-text-muted)" }}>
                  {stage.agents}
                </p>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className="h-[2px] flex-1 mt-[18px] mx-1"
                  style={{ backgroundColor: isDone ? "var(--color-accent)" : "var(--color-border)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}