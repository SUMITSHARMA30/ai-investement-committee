import { callStructuredAgent } from "@/lib/api-clients/mistral";
import { debateAgentOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";
import { formatReportsForPrompt } from "./shared";

export async function runBullAnalyst(
  ticker: string,
  priorReports: AgentReport[]
): Promise<AgentReport> {
  const systemPrompt =
    "You are the Bull Analyst on an institutional investment committee. Your job is " +
    "to actively argue FOR investing. Read the other analysts' findings and surface " +
    "every strength, opportunity, and reason for conviction you can find. You are the " +
    "committee's deliberate advocate for the opportunity, grounded in the evidence " +
    "presented, not promotional for its own sake.";

  const userPrompt = `
Ticker: ${ticker}

Other analysts' findings so far:

${formatReportsForPrompt(priorReports)}

Build the strongest possible case FOR investing in ${ticker}, using the evidence above.
`;

  const parsed = await callStructuredAgent(systemPrompt, userPrompt, debateAgentOutputSchema);

  return {
    agent: "Bull Analyst",
    ticker: ticker.toUpperCase(),
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    stance: "bullish",
    confidence: parsed.confidence,
    generatedAt: new Date().toISOString(),
  };
}