const API_KEY = process.env.FINNHUB_API_KEY;

export async function getCompanyProfile(ticker: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${API_KEY}`
  );

  return res.json();
}

export async function getBasicFinancials(ticker: string) {
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${API_KEY}`
  );

  return res.json();
}

export async function getCompanyNews(ticker: string) {
  const today = new Date();
  const from = new Date();

  from.setDate(today.getDate() - 30);

  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from
      .toISOString()
      .split("T")[0]}&to=${today
      .toISOString()
      .split("T")[0]}&token=${API_KEY}`
  );

  return res.json();
}