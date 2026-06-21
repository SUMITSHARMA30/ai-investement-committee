import { z } from "zod";

export const baseAgentOutputSchema = z.object({
  summary: z.string().describe("2-3 sentence overview"),
  keyPoints: z.array(z.string()).describe("4-6 concise bullet findings"),
  stance: z.enum(["bullish", "bearish", "neutral"]),
  confidence: z.number().min(0).max(100),
});

export const debateAgentOutputSchema = z.object({
  summary: z.string().describe("2-3 sentence overview of this side's case"),
  keyPoints: z.array(z.string()).describe("3-5 supporting arguments"),
  confidence: z.number().min(0).max(100),
});

export const riskOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  stance: z.enum(["bullish", "bearish", "neutral"]),
  confidence: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(["Low", "Medium", "High"]),
});

export const decisionOutputSchema = z.object({
  finalDecision: z.enum(["INVEST", "HOLD", "PASS"]),
  confidenceScore: z.number().min(0).max(100),
  investmentHorizon: z.enum([
    "Short-term (0-6 months)",
    "Medium-term (6-18 months)",
    "Long-term (18+ months)",
  ]),
  rationale: z.string(),
  disagreementsResolved: z.array(z.string()),
});