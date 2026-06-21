export interface FinancialSnapshot {
  ticker: string;
  companyName: string;
  sector: string;
  marketCap: number;
  peRatio: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  returnOnEquity: number | null;
  revenueTTM: number | null;
  quarterlyRevenueGrowthYOY: number | null;
  quarterlyEarningsGrowthYOY: number | null;
  totalLiabilities: number | null;
  totalShareholderEquity: number | null;
  debtToEquity: number | null;
}