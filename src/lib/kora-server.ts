/**
 * Server-side Kora JSON-RPC client.
 * This module is ONLY imported by API route handlers — never by client components.
 * Uses KORA_RPC_INTERNAL (server-only env var) — NOT exposed to the browser.
 */

interface KoraRPCRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: Record<string, unknown>;
}

interface KoraRPCResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

let requestId = 0;

function getKoraUrl(): string {
  const url = process.env.KORA_RPC_INTERNAL || process.env.NEXT_PUBLIC_KORA_RPC;
  if (!url) {
    throw new Error(
      "Missing KORA_RPC_INTERNAL or NEXT_PUBLIC_KORA_RPC environment variable"
    );
  }
  return url;
}

export async function koraRPC<T>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const body: KoraRPCRequest = {
    jsonrpc: "2.0",
    id: ++requestId,
    method,
    params,
  };

  const apiKey = process.env.KORA_API_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const res = await fetch(getKoraUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kora RPC HTTP ${res.status}: ${text}`);
  }

  const json: KoraRPCResponse<T> = await res.json();
  if (json.error) {
    throw new Error(
      `Kora RPC error: ${json.error.message} (code ${json.error.code})`
    );
  }

  return json.result as T;
}

// ─── Typed wrappers for every Kora method ───

export async function getConfig() {
  return koraRPC<{
    feePayers: string[];
    supportedTokens: string[];
    allowedPrograms: string[];
    maxTransactionFee: number;
    pricingModel: string;
    enabledMethods: string[];
  }>("getConfig");
}

export async function getPayerSigner() {
  return koraRPC<{
    signerAddress: string;
    paymentAddress: string;
  }>("getPayerSigner");
}

export async function getSupportedTokens() {
  return koraRPC<
    Array<{ mint: string; symbol?: string; decimals?: number }>
  >("getSupportedTokens");
}

export async function estimateTransactionFee(
  transaction: string,
  feeToken: string
) {
  return koraRPC<{ fee: string; feeToken: string }>(
    "estimateTransactionFee",
    { transaction, feeToken }
  );
}

export async function signTransaction(transaction: string) {
  return koraRPC<{ signedTransaction: string }>("signTransaction", {
    transaction,
  });
}

export async function signAndSendTransaction(transaction: string) {
  return koraRPC<{ signature: string }>("signAndSendTransaction", {
    transaction,
  });
}

export async function getBlockhash() {
  return koraRPC<{ blockhash: string; lastValidBlockHeight: number }>(
    "getBlockhash"
  );
}

export async function getPaymentInstruction(
  feeToken: string,
  payer: string,
  amount?: string
) {
  return koraRPC<{ instruction: string }>("getPaymentInstruction", {
    feeToken,
    payer,
    ...(amount ? { amount } : {}),
  });
}

export async function transferTransaction(params: {
  from: string;
  to: string;
  mint: string;
  amount: string;
  feeToken: string;
}) {
  return koraRPC<{ transaction: string }>("transferTransaction", params);
}
