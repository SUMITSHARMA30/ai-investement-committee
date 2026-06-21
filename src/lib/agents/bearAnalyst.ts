import { callStructuredAgent } from "@/lib/api-clients/mistral";
import { debateAgentOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";
import { formatReportsForPrompt } from "./shared";

export async function runBearAnalyst(
  ticker: string,
  priorReports: AgentReport[]
): Promise<AgentReport> {
  const systemPrompt =
    "You are the Bear Analyst on an institutional investment committee. Your job is " +
    "to actively argue AGAINST investing. Read the other analysts' findings and surface " +
    "every weakness, risk, and reason for caution you can find — even ones the other " +
    "analysts downplayed. You are the committee's deliberate devil's advocate, grounded " +
    "in the evidence presented, not negative for its own sake.";

  const userPrompt = `
Ticker: ${ticker}

Other analysts' findings so far:

${formatReportsForPrompt(priorReports)}

Build the strongest possible case AGAINST investing in ${ticker}, using the evidence above.
`;

  const parsed = await callStructuredAgent(systemPrompt, userPrompt, debateAgentOutputSchema);

  return {
    agent: "Bear Analyst",
    ticker: ticker.toUpperCase(),
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    stance: "bearish",
    confidence: parsed.confidence,
    generatedAt: new Date().toISOString(),
  };
}