"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CommitteeVoteTally } from "@/lib/types/decision";

const COLORS = { bullish: "#00d68f", bearish: "#ff4d6a", neutral: "#2dd4ff" };

export function VoteTallyChart({ tally }: { tally: CommitteeVoteTally }) {
  const data = [
    { name: "Bullish", value: tally.bullish, color: COLORS.bullish },
    { name: "Bearish", value: tally.bearish, color: COLORS.bearish },
    { name: "Neutral", value: tally.neutral, color: COLORS.neutral },
  ].filter((d) => d.value > 0);

  const total = tally.bullish + tally.bearish + tally.neutral;

  return (
    <div className="relative" style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={75} paddingAngle={3} stroke="none">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0c1019", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-mono-data font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {total}
        </span>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Votes
        </span>
      </div>
    </div>
  );
}