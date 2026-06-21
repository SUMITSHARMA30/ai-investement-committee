export interface CommitteeVoteTally {
  bullish: number;
  bearish: number;
  neutral: number;
}

export type FinalDecision = "INVEST" | "HOLD" | "PASS";

export type InvestmentHorizon =
  | "Short-term (0-6 months)"
  | "Medium-term (6-18 months)"
  | "Long-term (18+ months)";

export interface PortfolioManagerDecision {
  ticker: string;
  finalDecision: FinalDecision;
  confidenceScore: number;
  investmentHorizon: InvestmentHorizon;
  rationale: string;
  disagreementsResolved: string[];
  voteTally: CommitteeVoteTally;
  generatedAt: string;
}