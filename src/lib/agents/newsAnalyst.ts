import { callStructuredAgent } from "@/lib/api-clients/mistral";
import { getCompanyNews } from "@/lib/api-clients/finnhub";
import { baseAgentOutputSchema } from "@/lib/types/schemas";
import { AgentReport } from "@/lib/types/agent";

export async function runNewsAnalyst(
  ticker: string
): Promise<AgentReport> {
  const articles = await getCompanyNews(ticker);

  const recentArticles = articles.slice(0, 15);

  const headlineList = recentArticles
    .map(
      (item: any, i: number) =>
        `${i + 1}. ${item.headline} (${item.source})`
    )
    .join("\n");

  const systemPrompt =
    "You are the News & Sentiment Analyst on an institutional investment committee. " +
    "You review recent news headlines, identify important developments, and assess the overall market narrative around a company.";

  const userPrompt = `
Recent news for ${ticker}:

${headlineList || "No recent articles available."}

Summarize the dominant news narrative, major events, and overall sentiment.
`;

  const parsed = await callStructuredAgent(
    systemPrompt,
    userPrompt,
    baseAgentOutputSchema
  );

  return {
    agent: "News & Sentiment Analyst",
    ticker,
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    stance: parsed.stance,
    confidence: parsed.confidence,
    generatedAt: new Date().toISOString(),
    metrics: {
      articleCount: recentArticles.length,
    },
  };
}