import { FinancialSnapshot } from "@/lib/types/financial";
import { NewsDigest, NewsDigestItem } from "@/lib/types/news";

const BASE_URL = "https://www.alphavantage.co/query";
const MIN_SPACING_MS = 1100; // free tier allows ~1 request/second

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Global queue: every call chains onto this, so calls from DIFFERENT agents
// running in parallel still get spaced out correctly. This replaces the
// one-off sleep() we used in Milestone 3.
let requestQueue: Promise<void> = Promise.resolve();
let lastCallTime = 0;

async function waitForTurn() {
  const myTurn = requestQueue.then(async () => {
    const elapsed = Date.now() - lastCallTime;
    if (elapsed < MIN_SPACING_MS) {
      await sleep(MIN_SPACING_MS - elapsed);
    }
    lastCallTime = Date.now();
  });
  requestQueue = myTurn;
  await myTurn;
}

async function fetchAlphaVantage(params: Record<string, string>) {
  await waitForTurn();

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", process.env.ALPHA_VANTAGE_API_KEY ?? "");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Alpha Vantage HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (data["Note"] || data["Information"]) {
    throw new Error(
      `Alpha Vantage limit/info message: ${data["Note"] ?? data["Information"]}`
    );
  }

  return data;
}

function toNumberOrNull(val: string | undefined): number | null {
  if (val === undefined || val === "None" || val === "-") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

export async function getFinancialSnapshot(ticker: string): Promise<FinancialSnapshot> {
  const overview = await fetchAlphaVantage({ function: "OVERVIEW", symbol: ticker });
  const balanceSheet = await fetchAlphaVantage({ function: "BALANCE_SHEET", symbol: ticker });

  const latestReport = balanceSheet?.annualReports?.[0];
  const totalLiabilities = toNumberOrNull(latestReport?.totalLiabilities);
  const totalShareholderEquity = toNumberOrNull(latestReport?.totalShareholderEquity);

  const debtToEquity =
    totalLiabilities !== null && totalShareholderEquity !== null && totalShareholderEquity !== 0
      ? Number((totalLiabilities / totalShareholderEquity).toFixed(2))
      : null;

  return {
    ticker: ticker.toUpperCase(),
    companyName: overview.Name ?? ticker,
    sector: overview.Sector ?? "Unknown",
    marketCap: toNumberOrNull(overview.MarketCapitalization) ?? 0,
    peRatio: toNumberOrNull(overview.PERatio),
    profitMargin: toNumberOrNull(overview.ProfitMargin),
    operatingMargin: toNumberOrNull(overview.OperatingMarginTTM),
    returnOnEquity: toNumberOrNull(overview.ReturnOnEquityTTM),
    revenueTTM: toNumberOrNull(overview.RevenueTTM),
    quarterlyRevenueGrowthYOY: toNumberOrNull(overview.QuarterlyRevenueGrowthYOY),
    quarterlyEarningsGrowthYOY: toNumberOrNull(overview.QuarterlyEarningsGrowthYOY),
    totalLiabilities,
    totalShareholderEquity,
    debtToEquity,
  };
}
function looksLikeTicker(input: string): boolean {
  return /^[A-Za-z]{1,5}$/.test(input.trim());
}

export async function resolveTicker(input: string): Promise<string> {
  const trimmed = input.trim();

  // Skip the API call entirely if the input already looks like a ticker —
  // saves quota for the common case of someone typing "MSFT" directly.
  if (looksLikeTicker(trimmed)) {
    return trimmed.toUpperCase();
  }

  const data = await fetchAlphaVantage({ function: "SYMBOL_SEARCH", keywords: trimmed });
  const bestMatch = data?.bestMatches?.[0];

  if (!bestMatch || !bestMatch["1. symbol"]) {
    throw new Error(`Could not resolve "${input}" to a stock ticker.`);
  }

  return bestMatch["1. symbol"];
}

export async function getNewsDigest(ticker: string): Promise<NewsDigest> {
  const data = await fetchAlphaVantage({
    function: "NEWS_SENTIMENT",
    tickers: ticker,
    limit: "10",
  });

  const feed: any[] = data?.feed ?? [];

  const items: NewsDigestItem[] = feed.slice(0, 8).map((article) => {
    const tickerMatch = article.ticker_sentiment?.find(
      (t: any) => t.ticker === ticker.toUpperCase()
    );
    return {
      title: article.title,
      source: article.source,
      sentimentLabel: tickerMatch?.ticker_sentiment_label ?? article.overall_sentiment_label,
      sentimentScore: Number(
        tickerMatch?.ticker_sentiment_score ?? article.overall_sentiment_score ?? 0
      ),
    };
  });

  const averageSentimentScore =
    items.length > 0
      ? Number((items.reduce((sum, i) => sum + i.sentimentScore, 0) / items.length).toFixed(3))
      : 0;

  return {
    ticker: ticker.toUpperCase(),
    articleCount: items.length,
    averageSentimentScore,
    items,
  };
}