import { callStructuredAgent } from "@/lib/api-clients/mistral";
import { decisionOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";
import { PortfolioManagerDecision, CommitteeVoteTally } from "@/lib/types/decision";
import { formatReportsForPrompt } from "./shared";

function tallyVotes(reports: AgentReport[]): CommitteeVoteTally {
  const tally: CommitteeVoteTally = { bullish: 0, bearish: 0, neutral: 0 };
  for (const r of reports) {
    if (r.stance === "bullish") tally.bullish += 1;
    else if (r.stance === "bearish") tally.bearish += 1;
    else tally.neutral += 1;
  }
  return tally;
}

export async function runPortfolioManager(
  ticker: string,
  allReports: AgentReport[]
): Promise<PortfolioManagerDecision> {
  const voteTally = tallyVotes(allReports);

  const systemPrompt =
    "You are the Portfolio Manager chairing an institutional investment committee. " +
    "You have final authority. You have read every analyst's report, including the " +
    "Bear and Bull analysts, who are deliberate advocates by design — not independent " +
    "forecasters. Weigh the QUALITY of their arguments, not just their headcount. " +
    "Resolve disagreements explicitly, state what convinced you, and commit to one " +
    "final decision with a clear, defensible rationale.";

  const userPrompt = `
Ticker: ${ticker}

Raw committee vote tally (for reference only — do not treat this as the deciding factor):
Bullish: ${voteTally.bullish}
Bearish: ${voteTally.bearish}
Neutral: ${voteTally.neutral}

Full committee findings:

${formatReportsForPrompt(allReports)}

Make the final investment decision. Where analysts disagree, explicitly say which 
argument you found more convincing and why.
`;

  const parsed = await callStructuredAgent(
    systemPrompt,
    userPrompt,
    decisionOutputSchema,
    "mistral-large-latest"
  );

  return {
    ticker: ticker.toUpperCase(),
    finalDecision: parsed.finalDecision,
    confidenceScore: parsed.confidenceScore,
    investmentHorizon: parsed.investmentHorizon,
    rationale: parsed.rationale,
    disagreementsResolved: parsed.disagreementsResolved ?? [],
    voteTally,
    generatedAt: new Date().toISOString(),
  };
}