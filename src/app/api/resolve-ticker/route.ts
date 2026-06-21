import { NextRequest, NextResponse } from "next/server";
import { resolveQueryToTicker } from "@/lib/api-clients/resolver";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }
    const resolved = await resolveQueryToTicker(query);
    if (!resolved) {
      return NextResponse.json({ error: "Could not resolve company or ticker symbol" }, { status: 404 });
    }
    return NextResponse.json(resolved);
  } catch (err) {
    console.error("Ticker resolution error:", err);
    return NextResponse.json(
      { error: "Failed to resolve ticker", details: (err as Error).message },
      { status: 500 }
    );
  }
}
