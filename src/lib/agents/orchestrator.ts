import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { runResearchAnalyst } from "./researchAnalyst";
import { runFinancialAnalyst } from "./financialAnalyst";
import { runNewsAnalyst } from "./newsAnalyst";
import { runBearAnalyst } from "./bearAnalyst";
import { runBullAnalyst } from "./bullAnalyst";
import { runRiskOfficer } from "./riskOfficer";
import { runPortfolioManager } from "./portfolioManager";
import type { AgentReport } from "@/lib/types/agent";
import type { PortfolioManagerDecision } from "@/lib/types/decision";

const CommitteeState = Annotation.Root({
  rawInput: Annotation<string>,
  ticker: Annotation<string>,
  research: Annotation<AgentReport>,
  financial: Annotation<AgentReport>,
  news: Annotation<AgentReport>,
  bear: Annotation<AgentReport>,
  bull: Annotation<AgentReport>,
  risk: Annotation<AgentReport>,
  decision: Annotation<PortfolioManagerDecision>,
});

type CommitteeStateType = typeof CommitteeState.State;

async function resolveTicker(input: string): Promise<string> {
  return input.toUpperCase();
}

async function resolveTickerNode(state: CommitteeStateType) {
  const ticker = await resolveTicker(state.rawInput);
  return { ticker };
}

async function researchNode(state: CommitteeStateType) {
  return {
    research: await runResearchAnalyst(state.ticker),
  };
}

async function financialNode(state: CommitteeStateType) {
  return {
    financial: await runFinancialAnalyst(state.ticker),
  };
}

async function newsNode(state: CommitteeStateType) {
  return {
    news: await runNewsAnalyst(state.ticker),
  };
}

async function bearNode(state: CommitteeStateType) {
  const bear = await runBearAnalyst(state.ticker, [
    state.research,
    state.financial,
    state.news,
  ]);

  return { bear };
}

async function bullNode(state: CommitteeStateType) {
  const bull = await runBullAnalyst(state.ticker, [
    state.research,
    state.financial,
    state.news,
  ]);

  return { bull };
}

async function riskNode(state: CommitteeStateType) {
  const risk = await runRiskOfficer(state.ticker, [
    state.research,
    state.financial,
    state.news,
    state.bear,
    state.bull,
  ]);

  return { risk };
}

async function decisionNode(state: CommitteeStateType) {
  const decision = await runPortfolioManager(state.ticker, [
    state.research,
    state.financial,
    state.news,
    state.bear,
    state.bull,
    state.risk,
  ]);

  return { decision };
}

const committeeGraph = new StateGraph(CommitteeState)
  .addNode("resolve_ticker", resolveTickerNode)

  .addNode("research_agent", researchNode)
  .addNode("financial_agent", financialNode)
  .addNode("news_agent", newsNode)

  .addNode("bear_agent", bearNode)
  .addNode("bull_agent", bullNode)

  .addNode("risk_officer", riskNode)

  .addNode("portfolio_manager", decisionNode)

  .addEdge(START, "resolve_ticker")

  .addEdge("resolve_ticker", "research_agent")
  .addEdge("resolve_ticker", "financial_agent")
  .addEdge("resolve_ticker", "news_agent")

  .addEdge("research_agent", "bear_agent")
  .addEdge("financial_agent", "bear_agent")
  .addEdge("news_agent", "bear_agent")

  .addEdge("research_agent", "bull_agent")
  .addEdge("financial_agent", "bull_agent")
  .addEdge("news_agent", "bull_agent")

  .addEdge("bear_agent", "risk_officer")
  .addEdge("bull_agent", "risk_officer")

  .addEdge("risk_officer", "portfolio_manager")

  .addEdge("portfolio_manager", END)

  .compile();

export interface CommitteeRunResult {
  research: AgentReport;
  financial: AgentReport;
  news: AgentReport;
  bear: AgentReport;
  bull: AgentReport;
  risk: AgentReport;
  decision: PortfolioManagerDecision;
}

export async function runCommittee(
  rawInput: string
): Promise<CommitteeRunResult> {
  const finalState = await committeeGraph.invoke({
    rawInput,
  });

  return {
    research: finalState.research,
    financial: finalState.financial,
    news: finalState.news,
    bear: finalState.bear,
    bull: finalState.bull,
    risk: finalState.risk,
    decision: finalState.decision,
  };
}