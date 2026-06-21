import { AgentReport } from "@/lib/types/agent";

export function formatReportsForPrompt(reports: AgentReport[]): string {
  return reports
    .map(
      (r) =>
        `### ${r.agent} (stance: ${r.stance}, confidence: ${r.confidence})\n` +
        `Summary: ${r.summary}\n` +
        `Key points:\n${r.keyPoints.map((k) => `- ${k}`).join("\n")}`
    )
    .join("\n\n");
}