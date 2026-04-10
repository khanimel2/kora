import { NextResponse } from "next/server";
import { getBlockhash } from "@/lib/kora-server";

export async function GET() {
  try {
    const result = await getBlockhash();
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get blockhash";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
