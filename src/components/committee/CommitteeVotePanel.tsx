"use client";

import { AgentReport } from "@/lib/types/agent";
import { CommitteeVoteTally } from "@/lib/types/decision";
import { VoteTallyChart } from "./VoteTallyChart";

const STANCE_DOT: Record<string, string> = {
  bullish: "var(--color-bull)",
  bearish: "var(--color-bear)",
  neutral: "var(--color-accent)",
};

export function CommitteeVotePanel({
  reports,
  voteTally,
}: {
  reports: AgentReport[];
  voteTally: CommitteeVoteTally;
}) {
  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        Committee Vote
      </p>

      <VoteTallyChart tally={voteTally} />

      <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        {reports.map((r) => (
          <div key={r.agent} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STANCE_DOT[r.stance] }} />
              <span style={{ color: "var(--color-text-secondary)" }}>{r.agent}</span>
            </div>
            <span className="font-mono-data" style={{ color: "var(--color-text-muted)" }}>
              {r.confidence}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}