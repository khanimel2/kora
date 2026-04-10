import { NextResponse } from "next/server";
import { getConfig } from "@/lib/kora-server";

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get Kora config";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
