"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, ChevronDown, ArrowRight } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { POPULAR_TOKENS, TokenInfo, FEE_TOKEN_OPTIONS } from "@/lib/tokens";
import { transferTransaction, signAndSendTransaction } from "@/lib/kora";
import TokenSelector from "./TokenSelector";
import Mascot from "./Mascot";

export default function TransferPanel() {
  const { publicKey, signTransaction: walletSign, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [token, setToken] = useState<TokenInfo>(POPULAR_TOKENS[1]); // USDC
  const [feeToken, setFeeToken] = useState<TokenInfo>(FEE_TOKEN_OPTIONS[0]); // USDC
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectingToken, setSelectingToken] = useState(false);

  const [txState, setTxState] = useState<
    "idle" | "building" | "signing" | "sending" | "success" | "error"
  >("idle");
  const [txSig, setTxSig] = useState("");
  const [error, setError] = useState("");

  const mascotMood =
    txState === "success"
      ? "celebrating"
      : txState === "signing" || txState === "sending" || txState === "building"
      ? "thinking"
      : "idle";

  const mascotMessage =
    txState === "success"
      ? "🎉 Transfer complete! Gasless and fast!"
      : txState === "building"
      ? "⚡ Building your gasless transfer..."
      : txState === "signing"
      ? "✍️ Sign the transaction in your wallet..."
      : txState === "sending"
      ? "🚀 Sending to Solana..."
      : txState === "error"
      ? `😅 ${error}`
      : "💸 Send tokens without needing SOL for gas!";

  const executeTransfer = useCallback(async () => {
    if (!publicKey || !walletSign || !recipient || !amount) return;

    try {
      setTxState("building");
      setError("");

      // Use Kora's transferTransaction to build a gasless tx
      const { transaction: txBase64 } = await transferTransaction({
        from: publicKey.toBase58(),
        to: recipient,
        mint: token.mint,
        amount: amount,
        feeToken: feeToken.mint,
      });

      setTxState("signing");

      // Deserialize and sign with user wallet
      const txBuf = Buffer.from(txBase64, "base64");
      const tx = VersionedTransaction.deserialize(txBuf);
      const signed = await walletSign(tx);

      setTxState("sending");

      // Send via Kora's sign-and-send
      const signedBase64 = Buffer.from(signed.serialize()).toString("base64");
      const { signature } = await signAndSendTransaction(signedBase64);

      setTxSig(signature);
      setTxState("success");

      setTimeout(() => {
        setTxState("idle");
        setAmount("");
        setRecipient("");
      }, 6000);
    } catch (e: unknown) {
      setTxState("error");
      setError(e instanceof Error ? e.message : "Transfer failed");
      setTimeout(() => setTxState("idle"), 5000);
    }
  }, [publicKey, walletSign, recipient, amount, token, feeToken]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        width: "100%",
      }}
    >
      <Mascot
        mood={mascotMood as "idle" | "happy" | "thinking" | "celebrating"}
        message={mascotMessage}
        size={100}
      />

      <motion.div
        className="glass-card"
        style={{ width: "100%", maxWidth: 480, padding: 24, position: "relative" }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--kora-navy)",
              }}
            >
              Gasless Transfer
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Zap size={12} /> Zero SOL needed — Kora pays the gas
            </p>
          </div>
          <Send size={22} color="var(--kora-lavender-dark)" />
        </div>

        {/* Token Selection */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: 6,
              display: "block",
            }}
          >
            Token
          </label>
          <motion.button
            onClick={() => setSelectingToken(true)}
            className="token-select-minimal"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              background: "rgba(0,0,0,0.03)",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            <Image
              src={token.logoURI}
              alt={token.symbol}
              width={28}
              height={28}
              style={{ borderRadius: "50%" }}
              unoptimized
            />
            {token.symbol}
            <ChevronDown size={16} />
          </motion.button>
        </div>

        {/* Recipient */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: 6,
              display: "block",
            }}
          >
            Recipient Address
          </label>
          <input
            className="kora-input"
            placeholder="Enter Solana wallet address..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ fontFamily: "monospace", fontSize: 14 }}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: 6,
              display: "block",
            }}
          >
            Amount
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(0,0,0,0.02)",
              borderRadius: 12,
              padding: "4px 4px 4px 16px",
              border: "1px solid var(--border-strong)",
            }}
          >
            <input
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                outline: "none",
                padding: "10px 0",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                if (v.split(".").length <= 2) setAmount(v);
              }}
            />
            <div
              style={{
                padding: "8px 14px",
                background: "var(--kora-lavender-light)",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                color: "var(--kora-lavender-dark)",
              }}
            >
              {token.symbol}
            </div>
          </div>
        </div>

        {/* Fee Token Info */}
        <div
          style={{
            background: "rgba(0,0,0,0.02)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 18,
            fontSize: 13,
            color: "var(--text-secondary)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Zap size={12} /> Gas Fee
          </span>
          <span style={{ fontWeight: 600, color: "var(--kora-mint-dark)" }}>
            Gasless ✨
          </span>
        </div>

        {/* Action Button */}
        <div>
          {!connected ? (
            <motion.button
              onClick={() => setVisible(true)}
              className="kora-btn"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <img
                src="/kora_button_connect_wallet.png"
                alt="Connect Wallet"
                style={{ width: "100%", height: "auto" }}
              />
            </motion.button>
          ) : (
            <motion.button
              onClick={executeTransfer}
              disabled={
                !recipient || !amount || txState !== "idle"
              }
              className="kora-btn"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                opacity:
                  !recipient || !amount || txState !== "idle" ? 0.6 : 1,
                pointerEvents:
                  !recipient || !amount || txState !== "idle"
                    ? "none"
                    : "auto",
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <img
                src="/kora_button_primary.png"
                alt="Send Transfer"
                style={{ width: "100%", height: "auto" }}
              />
            </motion.button>
          )}
        </div>

        {/* Success */}
        <AnimatePresence>
          {txState === "success" && txSig && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 14,
                textAlign: "center",
                fontSize: 13,
              }}
            >
              <a
                href={`https://solscan.io/tx/${txSig}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--kora-lavender-dark)",
                  fontWeight: 600,
                  textDecoration: "underline",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                View on Solscan <ArrowRight size={14} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Token Selector Modal */}
      <TokenSelector
        isOpen={selectingToken}
        onClose={() => setSelectingToken(false)}
        onSelect={(t) => setToken(t)}
        selectedMint={token.mint}
      />
    </div>
  );
}
