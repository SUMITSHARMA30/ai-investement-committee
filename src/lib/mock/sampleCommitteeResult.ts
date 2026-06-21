import { CommitteeRunResult } from "@/lib/agents/orchestrator";

const now = new Date().toISOString();

export const sampleCommitteeResult: CommitteeRunResult = {
  research: {
    agent: "Research Analyst",
    ticker: "MSFT",
    summary:
      "Microsoft maintains a dominant position across cloud infrastructure, enterprise software, and productivity tools, anchored by a diversified business model that reduces reliance on any single revenue stream.",
    keyPoints: [
      "Azure holds the #2 global cloud market share position, with consistent share gains",
      "Microsoft 365 creates extremely high switching costs across enterprise customers",
      "Diversification across cloud, software, gaming, and hardware reduces single-segment dependency",
      "Deep enterprise integration and long-term contracts reinforce a durable moat",
    ],
    stance: "bullish",
    confidence: 81,
    generatedAt: now,
  },
  financial: {
    agent: "Financial Analyst",
    ticker: "MSFT",
    summary:
      "Microsoft shows strong profitability with healthy margins and consistent double-digit revenue growth, though valuation multiples are elevated relative to historical norms.",
    keyPoints: [
      "Profit margin near 36% reflects a highly efficient operating model",
      "Quarterly revenue growth YoY in the low-to-mid teens, driven primarily by cloud",
      "P/E ratio of roughly 35x suggests the market is pricing in continued growth",
      "Conservative balance sheet with manageable leverage relative to equity",
    ],
    stance: "bullish",
    confidence: 76,
    generatedAt: now,
    metrics: {
      marketCap: 3100000000000,
      peRatio: 35.4,
      profitMargin: 0.36,
      operatingMargin: 0.45,
      returnOnEquity: 0.33,
      revenueTTM: 245000000000,
      quarterlyRevenueGrowthYOY: 0.15,
      debtToEquity: 0.45,
    },
  },
  news: {
    agent: "News & Sentiment Analyst",
    ticker: "MSFT",
    summary:
      "Recent coverage skews positive, dominated by continued AI infrastructure investment and enterprise cloud adoption stories, with isolated coverage of regulatory scrutiny.",
    keyPoints: [
      "Majority of recent headlines focus on AI/Copilot enterprise rollout",
      "Positive analyst commentary on data center capacity expansion",
      "Minor negative coverage tied to ongoing EU antitrust attention",
      "Overall sentiment trend has been stable-to-improving over recent weeks",
    ],
    stance: "bullish",
    confidence: 68,
    generatedAt: now,
    metrics: { articleCount: 8, averageSentimentScore: 0.27 },
  },
  bear: {
    agent: "Bear Analyst",
    ticker: "MSFT",
    summary:
      "Valuation is stretched relative to historical multiples, and continued AI infrastructure spending could compress margins if growth doesn't keep pace with capex.",
    keyPoints: [
      "P/E of ~35x leaves little room for error if growth decelerates",
      "Heavy ongoing AI data center capex pressures near-term free cash flow",
      "EU regulatory scrutiny could result in costly bundling constraints",
      "Cloud growth, while strong, is decelerating from prior-year peak rates",
    ],
    stance: "bearish",
    confidence: 64,
    generatedAt: now,
  },
  bull: {
    agent: "Bull Analyst",
    ticker: "MSFT",
    summary:
      "Microsoft's diversified, high-margin business combined with AI-driven cloud demand supports continued durable growth, justifying a premium valuation.",
    keyPoints: [
      "Azure and AI services represent a multi-year growth runway, not a one-time catalyst",
      "High switching costs across its enterprise software suite protect pricing power",
      "Strong balance sheet provides flexibility to invest through near-term volatility",
      "Margin profile remains among the best in large-cap technology",
    ],
    stance: "bullish",
    confidence: 79,
    generatedAt: now,
  },
  risk: {
    agent: "Risk Officer",
    ticker: "MSFT",
    summary:
      "Overall risk is moderate: financial risk is low given strong margins and manageable leverage, but valuation and regulatory risk warrant caution.",
    keyPoints: [
      "Low financial/leverage risk given strong cash generation and moderate debt-to-equity",
      "Valuation risk is the primary concern — limited margin of safety at current multiples",
      "EU regulatory risk is a tail risk, not a near-term threat to core business",
      "Execution risk on AI capex is moderate given the scale of ongoing investment",
    ],
    stance: "neutral",
    confidence: 72,
    generatedAt: now,
    metrics: { riskScore: 38, riskLevel: "Medium" },
  },
  decision: {
    ticker: "MSFT",
    finalDecision: "INVEST",
    confidenceScore: 75,
    investmentHorizon: "Long-term (18+ months)",
    rationale:
      "The Bull Analyst's case for durable, multi-year AI and cloud growth is better grounded in the Financial Analyst's actual margin and growth data than the Bear Analyst's valuation concerns, which are real but not disqualifying on a long-term horizon. The Risk Officer's 'Medium' rating reflects valuation sensitivity rather than fundamental business risk, supporting a long-term INVEST stance with measured rather than high conviction.",
    disagreementsResolved: [
      "Bear flagged stretched valuation (P/E ~35x); Bull countered that durable double-digit growth justifies the premium — resolved in favor of a long-term INVEST given the Financial Analyst's growth data, despite near-term valuation risk.",
      "Bear raised EU regulatory risk; the Risk Officer classified this as a tail risk rather than a near-term threat, reducing its weight in the final call.",
    ],
    voteTally: { bullish: 4, bearish: 1, neutral: 1 },
    generatedAt: now,
  },
};