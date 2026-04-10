"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Settings, ChevronDown, Zap, Shield, Clock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePhantomConnect } from "@/hooks/usePhantomConnect";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { POPULAR_TOKENS, TokenInfo } from "@/lib/tokens";
import { getQuote, getSwapTransaction, formatTokenAmount, parseTokenAmount, JupiterQuote } from "@/lib/jupiter";
import TokenSelector from "./TokenSelector";
import Mascot from "./Mascot";

export default function SwapPanel() {
  const { publicKey, signTransaction: walletSign, connected } = useWallet();
  const { connectPhantom, connecting: walletConnecting } = usePhantomConnect();

  // Token state
  const [fromToken, setFromToken] = useState<TokenInfo>(POPULAR_TOKENS[2]); // BONK
  const [toToken, setToToken] = useState<TokenInfo>(POPULAR_TOKENS[0]); // SOL
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // UI state
  const [selectingFor, setSelectingFor] = useState<"from" | "to" | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Swap execution
  const [swapState, setSwapState] = useState<"idle" | "quoting" | "signing" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txSig, setTxSig] = useState("");

  // Mascot mood
  const mascotMood =
    swapState === "success"
      ? "celebrating"
      : swapState === "signing" || swapState === "sending"
      ? "thinking"
      : swapState === "error"
      ? "idle"
      : "idle";

  const mascotMessage =
    swapState === "success"
      ? "🎉 Swap successful! Your tokens are ready!"
      : swapState === "signing"
      ? "✍️ Please sign the transaction in your wallet..."
      : swapState === "sending"
      ? "⚡ Sending to Solana... almost there!"
      : swapState === "error"
      ? `😅 Oops! ${errorMsg}`
      : undefined;

  // Quote debounce
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setQuoteLoading(true);
        const rawAmount = parseTokenAmount(fromAmount, fromToken.decimals);
        const q = await getQuote(
          fromToken.mint,
          toToken.mint,
          rawAmount,
          Math.round(slippage * 100)
        );
        setQuote(q);
        setToAmount(formatTokenAmount(q.outAmount, toToken.decimals));
      } catch (e) {
        console.error("Quote error:", e);
        setToAmount("—");
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, slippage]);

  // Swap tokens
  const handleFlip = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setQuote(null);
  }, [fromToken, toToken, fromAmount, toAmount]);

  // Execute swap
  const executeSwap = useCallback(async () => {
    if (!publicKey || !walletSign || !quote) return;

    try {
      setSwapState("quoting");
      setErrorMsg("");

      // Get swap transaction from Jupiter
      const { swapTransaction } = await getSwapTransaction(
        quote,
        publicKey.toBase58()
      );

      setSwapState("signing");

      // Deserialize and sign
      const txBuf = Buffer.from(swapTransaction, "base64");
      const tx = VersionedTransaction.deserialize(txBuf);
      const signed = await walletSign(tx);

      setSwapState("sending");

      // Send via RPC
      const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC ||
        "https://api.mainnet-beta.solana.com";
      const connection = new Connection(rpcUrl, "confirmed");
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 3,
      });

      setTxSig(sig);
      setSwapState("success");

      // Reset after celebration
      setTimeout(() => {
        setSwapState("idle");
        setFromAmount("");
        setToAmount("");
        setQuote(null);
      }, 5000);
    } catch (e: unknown) {
      setSwapState("error");
      setErrorMsg(e instanceof Error ? e.message : "Transaction failed");
      setTimeout(() => setSwapState("idle"), 4000);
    }
  }, [publicKey, walletSign, quote]);

  const priceImpact = quote ? parseFloat(quote.priceImpactPct) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
      {/* Mascot */}
      <Mascot mood={mascotMood as "idle" | "happy" | "thinking" | "celebrating"} message={mascotMessage} size={100} />

      {/* Swap Card */}
      <motion.div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 24,
          position: "relative",
        }}
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
              Swap
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
              <Zap size={12} /> Gasless — powered by Kora
            </p>
          </div>
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "var(--bg-glass)",
              border: "1px solid var(--border-glass)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <Settings size={18} />
          </motion.button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              <div
                style={{
                  background: "var(--bg-glass)",
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  border: "1px solid var(--border-glass)",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  Slippage Tolerance
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[0.1, 0.5, 1.0, 3.0].map((val) => (
                    <motion.button
                      key={val}
                      onClick={() => setSlippage(val)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "var(--radius-pill)",
                        border:
                          slippage === val
                            ? "1.5px solid var(--kora-lavender)"
                            : "1px solid var(--border-glass)",
                        background:
                          slippage === val
                            ? "linear-gradient(135deg, var(--kora-lavender), var(--kora-lavender-dark))"
                            : "white",
                        color: slippage === val ? "white" : "var(--text-primary)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {val}%
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FROM Token Input */}
        <div
          style={{
            background: "var(--bg-glass)",
            borderRadius: "var(--radius-lg)",
            padding: 18,
            border: "1px solid var(--border-glass)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}
            >
              You Pay
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <input
              className="kora-input kora-input-lg"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                padding: 0,
              }}
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              value={fromAmount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                if (v.split(".").length <= 2) setFromAmount(v);
              }}
            />
            <motion.button
              onClick={() => setSelectingFor("from")}
              className="token-select"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Image
                src={fromToken.logoURI}
                alt={fromToken.symbol}
                width={24}
                height={24}
                style={{ borderRadius: "50%" }}
                unoptimized
              />
              {fromToken.symbol}
              <ChevronDown size={14} />
            </motion.button>
          </div>
        </div>

        {/* Swap Arrow */}
        <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
          <motion.button
            onClick={handleFlip}
            className="swap-arrow-container"
            whileHover={{ rotate: 180, scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowDown size={20} color="white" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* TO Token Input */}
        <div
          style={{
            background: "var(--bg-glass)",
            borderRadius: "var(--radius-lg)",
            padding: 18,
            border: "1px solid var(--border-glass)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}
            >
              You Receive
            </span>
            {quoteLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div className="kora-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Fetching...
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 22,
                fontWeight: 600,
                color: toAmount ? "var(--text-primary)" : "var(--text-muted)",
                padding: 0,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              {toAmount || "0.00"}
            </div>
            <motion.button
              onClick={() => setSelectingFor("to")}
              className="token-select"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Image
                src={toToken.logoURI}
                alt={toToken.symbol}
                width={24}
                height={24}
                style={{ borderRadius: "50%" }}
                unoptimized
              />
              {toToken.symbol}
              <ChevronDown size={14} />
            </motion.button>
          </div>
        </div>

        {/* Quote Details */}
        <AnimatePresence>
          {quote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  background: "var(--bg-glass)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-glass)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={12} /> Price Impact
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        priceImpact > 3
                          ? "#ef4444"
                          : priceImpact > 1
                          ? "#f59e0b"
                          : "var(--kora-mint-dark)",
                    }}
                  >
                    {priceImpact.toFixed(3)}%
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Zap size={12} /> Fee
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--kora-mint-dark)" }}>
                    Gasless ✨
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} /> Route
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {quote.routePlan
                      .map((r) => r.swapInfo.label)
                      .join(" → ")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap / Connect Button */}
        <div style={{ marginTop: 18 }}>
          {!connected ? (
            <motion.button
              type="button"
              onClick={() => connectPhantom()}
              disabled={walletConnecting}
              aria-busy={walletConnecting}
              className="kora-btn kora-btn-md"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                opacity: walletConnecting ? 0.75 : 1,
                cursor: walletConnecting ? "wait" : "pointer",
              }}
              whileHover={walletConnecting ? undefined : { scale: 1.03, y: -2 }}
              whileTap={walletConnecting ? undefined : { scale: 0.97 }}
            >
              <img
                src="/kora_button_connect_wallet.png"
                alt="Connect Wallet to Swap"
                style={{ width: "100%", height: "auto" }}
              />
            </motion.button>
          ) : (
            <motion.button
              onClick={executeSwap}
              disabled={
                !quote ||
                !fromAmount ||
                swapState !== "idle"
              }
              className="kora-btn kora-btn-md"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                opacity:
                  !quote || !fromAmount || swapState !== "idle" ? 0.6 : 1,
                pointerEvents:
                  !quote || !fromAmount || swapState !== "idle"
                    ? "none"
                    : "auto",
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <img
                src="/kora_button_primary.png"
                alt="Swap Now"
                style={{ width: "100%", height: "auto" }}
              />
            </motion.button>
          )}
        </div>

        {/* Success Signature */}
        <AnimatePresence>
          {swapState === "success" && txSig && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: 12,
                color: "var(--kora-mint-dark)",
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
                }}
              >
                View on Solscan ↗
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glowing orbs */}
        <div
          className="glow-orb glow-orb-lavender"
          style={{ width: 200, height: 200, top: -60, right: -60 }}
        />
        <div
          className="glow-orb glow-orb-mint"
          style={{ width: 160, height: 160, bottom: -40, left: -40 }}
        />
      </motion.div>

      {/* Token Selector Modal */}
      <TokenSelector
        isOpen={selectingFor !== null}
        onClose={() => setSelectingFor(null)}
        onSelect={(token) => {
          if (selectingFor === "from") {
            if (token.mint === toToken.mint) handleFlip();
            else setFromToken(token);
          } else {
            if (token.mint === fromToken.mint) handleFlip();
            else setToToken(token);
          }
        }}
        selectedMint={
          selectingFor === "from" ? fromToken.mint : toToken.mint
        }
      />
    </div>
  );
}
