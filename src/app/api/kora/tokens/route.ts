import { NextResponse } from "next/server";
import { getSupportedTokens } from "@/lib/kora-server";

export async function GET() {
  try {
    const tokens = await getSupportedTokens();
    return NextResponse.json(tokens);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get supported tokens";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
