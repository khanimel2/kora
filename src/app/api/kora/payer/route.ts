import { NextResponse } from "next/server";
import { getPayerSigner } from "@/lib/kora-server";

export async function GET() {
  try {
    const payer = await getPayerSigner();
    return NextResponse.json(payer);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get payer signer";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
