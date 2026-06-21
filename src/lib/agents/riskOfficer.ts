import { callStructuredAgent } from "@/lib/api-clients/mistral";
import { riskOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";
import { formatReportsForPrompt } from "./shared";

export async function runRiskOfficer(
  ticker: string,
  allReports: AgentReport[]
): Promise<AgentReport> {
  const systemPrompt =
    "You are the Risk Officer on an institutional investment committee. You do not " +
    "argue for or against investing — you objectively weigh the Research, Financial, " +
    "News, Bull, and Bear findings together and assess the OVERALL risk profile: " +
    "business risk, financial/leverage risk, and how strong the bear case is relative " +
    "to the bull case.";

  const userPrompt = `
Ticker: ${ticker}

All committee findings so far, including the bull/bear debate:

${formatReportsForPrompt(allReports)}

Assess the overall investment risk.
`;

  const parsed = await callStructuredAgent(systemPrompt, userPrompt, riskOutputSchema);

  return {
    agent: "Risk Officer",
    ticker: ticker.toUpperCase(),
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    stance: parsed.stance,
    confidence: parsed.confidence,
    generatedAt: new Date().toISOString(),
    metrics: {
      riskScore: parsed.riskScore,
      riskLevel: parsed.riskLevel,
    },
  };
}