import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";

const RPC_URL =
  process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";

/**
 * POST /api/transfer
 * Build a gasless SPL token transfer transaction.
 * The transaction is returned unsigned for the client to sign.
 *
 * Body: { from, to, mint, amount, decimals }
 * Returns: { transaction: base64, blockhash, lastValidBlockHeight }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, mint, amount, decimals } = body;

    if (!from || !to || !mint || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: from, to, mint, amount" },
        { status: 400 }
      );
    }

    const connection = new Connection(RPC_URL, "confirmed");
    const fromPK = new PublicKey(from);
    const toPK = new PublicKey(to);
    const mintPK = new PublicKey(mint);
    const rawAmount = Math.floor(
      parseFloat(amount) * Math.pow(10, decimals || 9)
    );

    const senderATA = await getAssociatedTokenAddress(mintPK, fromPK);
    const recipientATA = await getAssociatedTokenAddress(mintPK, toPK);

    const tx = new Transaction();

    // Create recipient ATA if it doesn't exist
    const recipientAccount = await connection.getAccountInfo(recipientATA);
    if (!recipientAccount) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromPK,
          recipientATA,
          toPK,
          mintPK
        )
      );
    }

    // Add transfer instruction
    tx.add(
      createTransferInstruction(senderATA, recipientATA, fromPK, rawAmount)
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPK;

    // Serialize the transaction for client-side signing
    const serialized = tx
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    return NextResponse.json({
      transaction: serialized,
      blockhash,
      lastValidBlockHeight,
    });
  } catch (error: unknown) {
    console.error("Transfer API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
