import { NextRequest, NextResponse } from "next/server";
import { getPaymentInstruction } from "@/lib/kora-server";

export async function POST(req: NextRequest) {
  try {
    const { feeToken, payer, amount } = await req.json();
    if (!feeToken || !payer) {
      return NextResponse.json(
        { error: "Missing feeToken or payer" },
        { status: 400 }
      );
    }
    const result = await getPaymentInstruction(feeToken, payer, amount);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get payment instruction";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
