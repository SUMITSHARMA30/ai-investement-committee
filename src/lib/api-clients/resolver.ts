import { z } from "zod";
import { searchSymbols } from "./finnhub";
import { callStructuredAgent } from "./mistral";

export async function resolveQueryToTicker(query: string): Promise<{ ticker: string; name: string } | null> {
  let searchTerm = query.trim();

  // 1. Try to extract the company name using Mistral if the query is a natural language question
  // Check if it's already a single uppercase word that looks like a ticker (e.g. "MSFT")
  const isPlainTicker = /^[A-Za-z]{1,5}$/.test(searchTerm);
  
  if (!isPlainTicker) {
    try {
      const extraction = await callStructuredAgent(
        "You are an expert financial entity resolver. Analyze the user's investment query and extract the single primary company name or stock ticker they want to analyze. If the user mentions comparing two companies (e.g. 'Compare Tesla and Rivian'), extract the first one (e.g. 'Tesla'). Return ONLY the company name or ticker symbol.",
        `User query: "${query}"`,
        z.object({
          companyName: z.string().describe("The extracted company name or ticker symbol, e.g. 'Microsoft' or 'Nvidia'")
        })
      );
      if (extraction.companyName && extraction.companyName.trim()) {
        searchTerm = extraction.companyName.trim();
      }
    } catch (e) {
      console.error("Mistral company extraction failed, using raw query:", e);
    }
  }

  // 2. Search via Finnhub
  try {
    const searchResults = await searchSymbols(searchTerm);
    if (searchResults && searchResults.result && searchResults.result.length > 0) {
      // Look for the first result that matches common stock or is a close match
      const bestMatch = searchResults.result.find(
        (r: any) => 
          r.type?.toLowerCase().includes("common stock") || 
          r.symbol?.toUpperCase() === searchTerm.toUpperCase()
      ) || searchResults.result[0];

      return {
        ticker: bestMatch.symbol,
        name: bestMatch.description || bestMatch.symbol,
      };
    }
  } catch (e) {
    console.error("Finnhub search failed:", e);
  }

  // 3. Fallback: If it looks like a symbol, return it
  if (searchTerm.length >= 1 && searchTerm.length <= 5 && /^[A-Za-z]+$/.test(searchTerm)) {
    return {
      ticker: searchTerm.toUpperCase(),
      name: searchTerm.toUpperCase(),
    };
  }

  return null;
}
