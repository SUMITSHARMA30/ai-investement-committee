export interface NewsDigestItem {
  title: string;
  source: string;
  sentimentLabel: string;
  sentimentScore: number;
}

export interface NewsDigest {
  ticker: string;
  articleCount: number;
  averageSentimentScore: number;
  items: NewsDigestItem[];
}