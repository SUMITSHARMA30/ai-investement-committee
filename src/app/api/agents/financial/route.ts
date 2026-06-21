import { NextRequest, NextResponse } from "next/server";
import { runFinancialAnalyst } from "@/lib/agents/financialAnalyst";

export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }

    const report = await runFinancialAnalyst(ticker);
    return NextResponse.json(report);
  } catch (err) {
    console.error("Financial Analyst error:", err);
    return NextResponse.json(
      { error: "Failed to generate financial report", details: (err as Error).message },
      { status: 500 }
    );
  }
}