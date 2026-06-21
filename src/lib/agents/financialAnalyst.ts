
import { callStructuredAgent } from "@/lib/api-clients/mistral";
import {
  getBasicFinancials,
  getCompanyProfile,
} from "@/lib/api-clients/finnhub";
import { baseAgentOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";

export async function runFinancialAnalyst(
  ticker: string
): Promise<AgentReport> {
  const [profile, financials] = await Promise.all([
    getCompanyProfile(ticker),
    getBasicFinancials(ticker),
  ]);

  const metrics = financials.metric ?? {};

  const snapshot = {
    ticker,
    companyName: profile.name ?? ticker,
    sector: profile.finnhubIndustry ?? "Unknown",

    marketCap: metrics.marketCapitalization ?? 0,
    peRatio: metrics.peBasicExclExtraTTM ?? 0,
    profitMargin: metrics.netMargin ?? 0,
    operatingMargin: metrics.operatingMarginTTM ?? 0,
    returnOnEquity: metrics.roeTTM ?? 0,
    revenueTTM: metrics.revenuePerShareTTM ?? 0,
    quarterlyRevenueGrowthYOY:
      metrics.revenueGrowthTTMYoy ?? 0,
    debtToEquity:
      metrics.totalDebtToEquityQuarterly ?? 0,
  };

  const systemPrompt =
    "You are the Financial Analyst on an institutional investment committee. " +
    "You analyze real financial metrics and explain what they imply about the investment case. " +
    "You never invent numbers and only use the provided data.";

  const userPrompt = `
Financial data for ${snapshot.companyName} (${snapshot.ticker})

Industry: ${snapshot.sector}

Market Cap: ${snapshot.marketCap}
P/E Ratio: ${snapshot.peRatio}
Profit Margin: ${snapshot.profitMargin}
Operating Margin: ${snapshot.operatingMargin}
Return On Equity: ${snapshot.returnOnEquity}
Revenue Per Share TTM: ${snapshot.revenueTTM}
Revenue Growth YoY: ${snapshot.quarterlyRevenueGrowthYOY}
Debt To Equity: ${snapshot.debtToEquity}

Analyze profitability, growth quality, valuation, and leverage risk.
`;

  const parsed = await callStructuredAgent(
    systemPrompt,
    userPrompt,
    baseAgentOutputSchema
  );

  return {
    agent: "Financial Analyst",
    ticker: snapshot.ticker,
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    stance: parsed.stance,
    confidence: parsed.confidence,
    generatedAt: new Date().toISOString(),
    metrics: {
      marketCap: snapshot.marketCap,
      peRatio: snapshot.peRatio,
      profitMargin: snapshot.profitMargin,
      operatingMargin: snapshot.operatingMargin,
      returnOnEquity: snapshot.returnOnEquity,
      revenueTTM: snapshot.revenueTTM,
      quarterlyRevenueGrowthYOY:
        snapshot.quarterlyRevenueGrowthYOY,
      debtToEquity: snapshot.debtToEquity,
    },
  };
}

