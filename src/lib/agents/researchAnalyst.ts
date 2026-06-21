import { callStructuredAgent } from "@/lib/api-clients/mistral";
import { baseAgentOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";

export async function runResearchAnalyst(ticker: string): Promise<AgentReport> {
  const systemPrompt =
    "You are the Research Analyst on an institutional investment committee. " +
    "You evaluate a company's business model, industry position, and competitive " +
    "advantages. You are objective and evidence-based, not promotional.";

  const userPrompt = `
Analyze ${ticker}.

Cover:
1. What the business model actually is
2. Its position within its industry (leader, challenger, niche player)
3. Its real competitive advantages (moat), if any
`;

  const parsed = await callStructuredAgent(systemPrompt, userPrompt, baseAgentOutputSchema);

  return {
    agent: "Research Analyst",
    ticker: ticker.toUpperCase(),
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    stance: parsed.stance,
    confidence: parsed.confidence,
    generatedAt: new Date().toISOString(),
  };
}