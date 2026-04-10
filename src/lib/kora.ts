/**
 * Client-side Kora API — calls our own /api/kora/* routes.
 * These routes proxy to the actual Kora RPC server on the backend,
 * keeping the Kora endpoint and API key completely server-side.
 */

const API_BASE = "/api/kora";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || `API error ${res.status}`);
  }

  return json as T;
}

// ─── GET Methods ───

export async function getKoraConfig() {
  return api<{
    feePayers: string[];
    supportedTokens: string[];
    allowedPrograms: string[];
    maxTransactionFee: number;
    pricingModel: string;
    enabledMethods: string[];
  }>("/config");
}

export async function getPayerSigner() {
  return api<{
    signerAddress: string;
    paymentAddress: string;
  }>("/payer");
}

export async function getSupportedTokens() {
  return api<Array<{ mint: string; symbol?: string; decimals?: number }>>(
    "/tokens"
  );
}

export async function getBlockhash() {
  return api<{ blockhash: string; lastValidBlockHeight: number }>(
    "/blockhash"
  );
}

// ─── POST Methods ───

export async function estimateTransactionFee(
  transaction: string,
  feeToken: string
) {
  return api<{ fee: string; feeToken: string }>("/estimate", {
    method: "POST",
    body: JSON.stringify({ transaction, feeToken }),
  });
}

export async function signTransaction(transaction: string) {
  return api<{ signedTransaction: string }>("/sign", {
    method: "POST",
    body: JSON.stringify({ transaction }),
  });
}

export async function signAndSendTransaction(transaction: string) {
  return api<{ signature: string }>("/sign-send", {
    method: "POST",
    body: JSON.stringify({ transaction }),
  });
}

export async function getPaymentInstruction(
  feeToken: string,
  payer: string,
  amount?: string
) {
  return api<{ instruction: string }>("/payment-instruction", {
    method: "POST",
    body: JSON.stringify({ feeToken, payer, ...(amount ? { amount } : {}) }),
  });
}

export async function transferTransaction(params: {
  from: string;
  to: string;
  mint: string;
  amount: string;
  feeToken: string;
}) {
  return api<{ transaction: string }>("/transfer", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
