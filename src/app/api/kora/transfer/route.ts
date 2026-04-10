import { NextRequest, NextResponse } from "next/server";
import { transferTransaction } from "@/lib/kora-server";

export async function POST(req: NextRequest) {
  try {
    const { from, to, mint, amount, feeToken } = await req.json();
    if (!from || !to || !mint || !amount || !feeToken) {
      return NextResponse.json(
        { error: "Missing required fields: from, to, mint, amount, feeToken" },
        { status: 400 }
      );
    }
    const result = await transferTransaction({ from, to, mint, amount, feeToken });
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Transfer transaction failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
