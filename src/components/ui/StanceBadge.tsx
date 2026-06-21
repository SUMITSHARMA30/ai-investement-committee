import { AgentStance } from "@/lib/types/agent";

const STANCE_STYLES: Record<AgentStance, { label: string; color: string; glow: string }> = {
  bullish: { label: "BULLISH", color: "var(--color-bull)", glow: "rgba(0, 214, 143, 0.15)" },
  bearish: { label: "BEARISH", color: "var(--color-bear)", glow: "rgba(255, 77, 106, 0.15)" },
  neutral: { label: "NEUTRAL", color: "var(--color-accent)", glow: "rgba(45, 212, 255, 0.15)" },
};

export function StanceBadge({ stance }: { stance: AgentStance }) {
  const style = STANCE_STYLES[stance];
  return (
    <span
      className="font-mono-data text-[11px] tracking-wider px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{ color: style.color, borderColor: style.color, backgroundColor: style.glow }}
    >
      {style.label}
    </span>
  );
}