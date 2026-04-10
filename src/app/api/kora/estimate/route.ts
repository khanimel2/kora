import { NextRequest, NextResponse } from "next/server";
import { estimateTransactionFee } from "@/lib/kora-server";

export async function POST(req: NextRequest) {
  try {
    const { transaction, feeToken } = await req.json();
    if (!transaction || !feeToken) {
      return NextResponse.json(
        { error: "Missing transaction or feeToken" },
        { status: 400 }
      );
    }
    const result = await estimateTransactionFee(transaction, feeToken);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Fee estimation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
