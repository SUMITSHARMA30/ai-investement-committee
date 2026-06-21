export type AgentStance = "bullish" | "bearish" | "neutral";

export interface AgentReport {
  agent: string;
  ticker: string;
  summary: string;
  keyPoints: string[];
  stance: AgentStance;
  confidence: number;
  generatedAt: string;
  metrics?: Record<string, number | string | null>;
}