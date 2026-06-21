import { NextRequest, NextResponse } from "next/server";
import { runNewsAnalyst } from "@/lib/agents/newsAnalyst";

export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }
    const report = await runNewsAnalyst(ticker);
    return NextResponse.json(report);
  } catch (err) {
    console.error("News Analyst error:", err);
    return NextResponse.json(
      { error: "Failed to generate news report", details: (err as Error).message },
      { status: 500 }
    );
  }
}