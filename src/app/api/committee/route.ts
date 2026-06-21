import { NextRequest, NextResponse } from "next/server";
import { runCommittee } from "@/lib/agents/orchestrator";
import { loadEnvFallback } from "@/lib/api-clients/envLoader";

export async function POST(req: NextRequest) {
  try {
    loadEnvFallback();
    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }
    const result = await runCommittee(ticker);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Committee orchestration error:", err);
    return NextResponse.json(
      { error: "Failed to run investment committee", details: (err as Error).message },
      { status: 500 }
    );
  }
}