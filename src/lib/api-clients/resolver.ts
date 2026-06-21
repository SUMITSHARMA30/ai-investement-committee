import { z } from "zod";
import { getCompanyProfile, searchSymbols } from "./finnhub";
import { callStructuredAgent } from "./mistral";

export async function resolveQueryToTicker(query: string): Promise<{ ticker: string; name: string } | null> {
  const searchTerm = query.trim();

  // 1. Try to resolve the query directly to a ticker and company name using Mistral
  try {
    const resolution = await callStructuredAgent(
      "You are an expert financial entity resolver. Analyze the user's investment query and resolve it to the standard stock ticker symbol and full name of the primary company they want to analyze. If the user mentions comparing two companies, resolve to the first company. Example: 'should i invest in google' -> ticker: 'GOOG', companyName: 'Alphabet Inc'.",
      `User query: "${searchTerm}"`,
      z.object({
        ticker: z.string().describe("The standard 1-5 letter stock ticker symbol, e.g. MSFT, AAPL, GOOG"),
        companyName: z.string().describe("The full name of the company, e.g. Microsoft Corp, Apple Inc, Alphabet Inc")
      })
    );

    if (resolution.ticker) {
      const cleanTicker = resolution.ticker.trim().toUpperCase();
      
      // Verify via Finnhub Company Profile lookup (highly reliable for valid tickers)
      const profile = await getCompanyProfile(cleanTicker);
      if (profile && Object.keys(profile).length > 0 && profile.ticker) {
        return {
          ticker: profile.ticker.toUpperCase(),
          name: profile.name || resolution.companyName || profile.ticker
        };
      }
      
      // Fallback: If profile lookup failed but ticker looks like a direct ticker input, return it
      if (cleanTicker.length >= 1 && cleanTicker.length <= 5 && /^[A-Za-z]+$/.test(cleanTicker)) {
        return {
          ticker: cleanTicker,
          name: resolution.companyName || cleanTicker
        };
      }
    }
  } catch (e) {
    console.error("Mistral resolution failed, falling back to keyword search:", e);
  }

  // 2. Search via Finnhub search (as a fallback)
  try {
    const searchResults = await searchSymbols(searchTerm);
    if (searchResults && searchResults.result && searchResults.result.length > 0) {
      const bestMatch = searchResults.result.find(
        (r: any) => 
          r.type?.toLowerCase().includes("common stock") || 
          r.symbol?.toUpperCase() === searchTerm.toUpperCase()
      ) || searchResults.result[0];

      return {
        ticker: bestMatch.symbol.toUpperCase(),
        name: bestMatch.description || bestMatch.symbol,
      };
    }
  } catch (e) {
    console.error("Finnhub search failed:", e);
  }

  // 3. Last fallback: if the query itself is a potential ticker, use it
  const isPlainTicker = /^[A-Za-z]{1,5}$/.test(searchTerm);
  if (isPlainTicker) {
    return {
      ticker: searchTerm.toUpperCase(),
      name: searchTerm.toUpperCase(),
    };
  }

  return null;
}
