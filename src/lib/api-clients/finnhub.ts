import { loadEnvFallback } from "./envLoader";

function getApiKey() {
  loadEnvFallback();
  return process.env.FINNHUB_API_KEY;
}

export async function getCompanyProfile(ticker: string) {
  const token = getApiKey();
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${token}`
  );

  return res.json();
}

export async function getBasicFinancials(ticker: string) {
  const token = getApiKey();
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${token}`
  );

  return res.json();
}

export async function getCompanyNews(ticker: string) {
  const today = new Date();
  const from = new Date();

  from.setDate(today.getDate() - 30);

  const token = getApiKey();
  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from
      .toISOString()
      .split("T")[0]}&to=${today
      .toISOString()
      .split("T")[0]}&token=${token}`
  );

  return res.json();
}

export async function searchSymbols(query: string) {
  const token = getApiKey();
  const res = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${token}`
  );

  return res.json();
}
export async function resolveTicker(input: string): Promise<string> {
  const text = input.trim().toLowerCase();

  const companyMap: Record<string, string> = {
    tesla: "TSLA",
    microsoft: "MSFT",
    apple: "AAPL",
    amazon: "AMZN",
    google: "GOOGL",
    alphabet: "GOOGL",
    nvidia: "NVDA",
    meta: "META",
    netflix: "NFLX",
    amd: "AMD",
    intel: "INTC",
    oracle: "ORCL",
    salesforce: "CRM",
    adobe: "ADBE",
    cisco: "CSCO",
  };

  for (const [company, ticker] of Object.entries(companyMap)) {
    if (text.includes(company)) {
      return ticker;
    }
  }

  if (/^[A-Z]{1,5}$/i.test(input.trim())) {
    return input.trim().toUpperCase();
  }

  const search = await searchSymbols(input);

  if (search.result?.length) {
    return search.result[0].symbol;
  }

  throw new Error(
    "Could not resolve company name. Please verify the spelling or try inputting a direct ticker symbol."
  );
}