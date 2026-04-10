import { JUPITER_API_BASE } from "./tokens";

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
}

export interface JupiterSwapResponse {
  swapTransaction: string; // base64 encoded transaction
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

/**
 * Get a swap quote from Jupiter
 */
export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: number = 50
): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    slippageBps: slippageBps.toString(),
    swapMode: "ExactIn",
  });

  const res = await fetch(`${JUPITER_API_BASE}/swap/v1/quote?${params}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jupiter quote failed: ${err}`);
  }
  return res.json();
}

/**
 * Build swap transaction from Jupiter
 */
export async function getSwapTransaction(
  quoteResponse: JupiterQuote,
  userPublicKey: string,
  feeAccount?: string
): Promise<JupiterSwapResponse> {
  const body: Record<string, unknown> = {
    quoteResponse,
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
  };

  if (feeAccount) {
    body.feeAccount = feeAccount;
  }

  const res = await fetch(`${JUPITER_API_BASE}/swap/v1/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jupiter swap failed: ${err}`);
  }
  return res.json();
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const adjusted = num / Math.pow(10, decimals);
  if (adjusted >= 1e6) return `${(adjusted / 1e6).toFixed(2)}M`;
  if (adjusted >= 1e3) return `${(adjusted / 1e3).toFixed(2)}K`;
  if (adjusted < 0.001) return adjusted.toExponential(2);
  return adjusted.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

/**
 * Parse human-readable amount to raw amount
 */
export function parseTokenAmount(
  humanAmount: string,
  decimals: number
): string {
  const num = parseFloat(humanAmount);
  if (isNaN(num)) return "0";
  return Math.floor(num * Math.pow(10, decimals)).toString();
}
