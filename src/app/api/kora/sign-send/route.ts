import { NextRequest, NextResponse } from "next/server";
import { signAndSendTransaction } from "@/lib/kora-server";

export async function POST(req: NextRequest) {
  try {
    const { transaction } = await req.json();
    if (!transaction) {
      return NextResponse.json(
        { error: "Missing transaction" },
        { status: 400 }
      );
    }
    const result = await signAndSendTransaction(transaction);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Sign and send failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
