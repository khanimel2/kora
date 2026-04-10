import { NextRequest, NextResponse } from "next/server";

const JUPITER_API = "https://api.jup.ag";

/**
 * POST /api/swap
 * Proxies swap requests to Jupiter API to keep routing server-side.
 * Accepts: { inputMint, outputMint, amount, slippageBps, userPublicKey }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputMint, outputMint, amount, slippageBps, userPublicKey } = body;

    if (!inputMint || !outputMint || !amount || !userPublicKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Get quote
    const quoteParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: (slippageBps || 50).toString(),
      swapMode: "ExactIn",
    });

    const quoteRes = await fetch(
      `${JUPITER_API}/swap/v1/quote?${quoteParams}`
    );

    if (!quoteRes.ok) {
      const err = await quoteRes.text();
      return NextResponse.json(
        { error: `Quote failed: ${err}` },
        { status: 502 }
      );
    }

    const quoteData = await quoteRes.json();

    // Step 2: Build swap transaction
    const swapRes = await fetch(`${JUPITER_API}/swap/v1/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "medium",
          },
        },
      }),
    });

    if (!swapRes.ok) {
      const err = await swapRes.text();
      return NextResponse.json(
        { error: `Swap build failed: ${err}` },
        { status: 502 }
      );
    }

    const swapData = await swapRes.json();

    return NextResponse.json({
      quote: quoteData,
      swapTransaction: swapData.swapTransaction,
      lastValidBlockHeight: swapData.lastValidBlockHeight,
    });
  } catch (error: unknown) {
    console.error("Swap API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
