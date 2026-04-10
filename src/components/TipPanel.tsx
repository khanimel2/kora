"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Plus,
  Trash2,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Gift,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePhantomConnect } from "@/hooks/usePhantomConnect";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { POPULAR_TOKENS, TokenInfo } from "@/lib/tokens";
import TokenSelector from "./TokenSelector";
import Mascot from "./Mascot";

type TabMode = "tip" | "airdrop";

interface AirdropEntry {
  address: string;
  amount: string;
  id: string;
}

export default function TipPanel() {
  const { publicKey, signTransaction: walletSign, connected } = useWallet();
  const { connectPhantom, connecting: walletConnecting } = usePhantomConnect();

  const [mode, setMode] = useState<TabMode>("tip");
  const [token, setToken] = useState<TokenInfo>(POPULAR_TOKENS[2]); // BONK
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  // Tip state
  const [tipAddress, setTipAddress] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");

  // Airdrop state
  const [airdropEntries, setAirdropEntries] = useState<AirdropEntry[]>([
    { address: "", amount: "", id: "1" },
  ]);
  const [airdropAmountEach, setAirdropAmountEach] = useState("");

  // Execution
  const [sendState, setSendState] = useState<
    "idle" | "building" | "signing" | "sending" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txSig, setTxSig] = useState("");
  const [deliveredCount, setDeliveredCount] = useState(0);

  const mascotMood =
    sendState === "success"
      ? "celebrating"
      : sendState === "signing" || sendState === "sending"
      ? "thinking"
      : "idle";

  const mascotMessage =
    sendState === "success"
      ? mode === "tip"
        ? "🎉 Tip sent! You're so generous!"
        : `🎉 Airdrop delivered to ${deliveredCount} wallets!`
      : sendState === "signing"
      ? "✍️ Sign to send those tokens..."
      : sendState === "sending"
      ? mode === "tip"
        ? "🚚 Delivering your tip..."
        : "🚁 Airdropping tokens..."
      : sendState === "error"
      ? `😅 ${errorMsg}`
      : mode === "tip"
      ? "💜 Tip your friends with meme tokens — zero gas!"
      : "🎁 Airdrop tokens to multiple wallets at once!";

  const addEntry = useCallback(() => {
    setAirdropEntries((prev) => [
      ...prev,
      { address: "", amount: "", id: Date.now().toString() },
    ]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setAirdropEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback(
    (id: string, field: "address" | "amount", value: string) => {
      setAirdropEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      );
    },
    []
  );

  // Build and send tip
  const executeTip = useCallback(async () => {
    if (!publicKey || !walletSign) return;

    try {
      setSendState("building");
      setErrorMsg("");

      const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC ||
        "https://api.mainnet-beta.solana.com";
      const connection = new Connection(rpcUrl, "confirmed");

      const recipientPK = new PublicKey(tipAddress);
      const mintPK = new PublicKey(token.mint);
      const amount = Math.floor(
        parseFloat(tipAmount) * Math.pow(10, token.decimals)
      );

      const senderATA = await getAssociatedTokenAddress(mintPK, publicKey);
      const recipientATA = await getAssociatedTokenAddress(
        mintPK,
        recipientPK
      );

      const tx = new Transaction();

      // Check if recipient ATA exists
      try {
        await getAccount(connection, recipientATA);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientATA,
            recipientPK,
            mintPK
          )
        );
      }

      tx.add(
        createTransferInstruction(senderATA, recipientATA, publicKey, amount)
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      setSendState("signing");
      const signed = await walletSign(tx);

      setSendState("sending");
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
      });

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      setTxSig(sig);
      setSendState("success");
      setTimeout(() => {
        setSendState("idle");
        setTipAddress("");
        setTipAmount("");
        setTipMessage("");
      }, 5000);
    } catch (e: unknown) {
      setSendState("error");
      setErrorMsg(e instanceof Error ? e.message : "Tip failed");
      setTimeout(() => setSendState("idle"), 4000);
    }
  }, [publicKey, walletSign, tipAddress, tipAmount, token]);

  // Build and send airdrop
  const executeAirdrop = useCallback(async () => {
    if (!publicKey || !walletSign) return;

    const validEntries = airdropEntries.filter(
      (e) => e.address.trim() && (e.amount.trim() || airdropAmountEach.trim())
    );

    if (validEntries.length === 0) return;

    try {
      setSendState("building");
      setErrorMsg("");

      const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC ||
        "https://api.mainnet-beta.solana.com";
      const connection = new Connection(rpcUrl, "confirmed");

      const mintPK = new PublicKey(token.mint);
      const senderATA = await getAssociatedTokenAddress(mintPK, publicKey);

      const tx = new Transaction();
      let count = 0;

      for (const entry of validEntries) {
        try {
          const recipientPK = new PublicKey(entry.address.trim());
          const recipientATA = await getAssociatedTokenAddress(
            mintPK,
            recipientPK
          );
          const amt = Math.floor(
            parseFloat(entry.amount || airdropAmountEach) *
              Math.pow(10, token.decimals)
          );

          try {
            await getAccount(connection, recipientATA);
          } catch {
            tx.add(
              createAssociatedTokenAccountInstruction(
                publicKey,
                recipientATA,
                recipientPK,
                mintPK
              )
            );
          }

          tx.add(
            createTransferInstruction(
              senderATA,
              recipientATA,
              publicKey,
              amt
            )
          );
          count++;
        } catch (e) {
          console.warn(`Skipping invalid address: ${entry.address}`, e);
        }
      }

      if (count === 0) throw new Error("No valid recipients");

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      setSendState("signing");
      const signed = await walletSign(tx);

      setSendState("sending");
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
      });

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      setTxSig(sig);
      setDeliveredCount(count);
      setSendState("success");

      setTimeout(() => {
        setSendState("idle");
        setAirdropEntries([{ address: "", amount: "", id: "1" }]);
        setAirdropAmountEach("");
      }, 5000);
    } catch (e: unknown) {
      setSendState("error");
      setErrorMsg(e instanceof Error ? e.message : "Airdrop failed");
      setTimeout(() => setSendState("idle"), 4000);
    }
  }, [publicKey, walletSign, airdropEntries, airdropAmountEach, token]);

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
      {/* Mascot */}
      <Mascot
        mood={mascotMood as "idle" | "happy" | "thinking" | "celebrating"}
        message={mascotMessage}
        size={100}
      />

      {/* Main Card */}
      <motion.div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 24,
          position: "relative",
          overflow: "visible",
        }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 200,
          delay: 0.2,
        }}
      >
        {/* Sub-tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: "var(--bg-glass)",
            borderRadius: "var(--radius-pill)",
            padding: 4,
            border: "1px solid var(--border-glass)",
          }}
        >
          <button
            className={`kora-tab ${mode === "tip" ? "kora-tab-active" : ""}`}
            onClick={() => setMode("tip")}
            style={{ flex: 1 }}
          >
            <Send size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Tip
          </button>
          <button
            className={`kora-tab ${mode === "airdrop" ? "kora-tab-active" : ""}`}
            onClick={() => setMode("airdrop")}
            style={{ flex: 1 }}
          >
            <Gift size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Airdrop
          </button>
        </div>

        {/* Token Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            Token to{" "}
            {mode === "tip" ? "tip" : "airdrop"}
          </span>
          <motion.button
            onClick={() => setShowTokenSelect(true)}
            className="token-select"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Image
              src={token.logoURI}
              alt={token.symbol}
              width={22}
              height={22}
              style={{ borderRadius: "50%" }}
              unoptimized
            />
            {token.symbol}
            <ChevronDown size={14} />
          </motion.button>
        </div>

        {/* TIP MODE */}
        <AnimatePresence mode="wait">
          {mode === "tip" ? (
            <motion.div
              key="tip"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
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
                    placeholder="Solana wallet address..."
                    value={tipAddress}
                    onChange={(e) => setTipAddress(e.target.value)}
                  />
                </div>
                <div>
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
                  <input
                    className="kora-input kora-input-lg"
                    placeholder="0.00"
                    type="text"
                    inputMode="decimal"
                    value={tipAmount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      if (v.split(".").length <= 2) setTipAmount(v);
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Message (optional)
                  </label>
                  <input
                    className="kora-input"
                    placeholder="gm fren! 🐸"
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Send Tip Button */}
              <div style={{ marginTop: 20 }}>
                {!connected ? (
                  <motion.button
                    type="button"
                    onClick={() => connectPhantom()}
                    disabled={walletConnecting}
                    aria-busy={walletConnecting}
                    className="kora-btn kora-btn-lg"
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
                      alt="Connect Wallet"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={executeTip}
                    disabled={
                      !tipAddress ||
                      !tipAmount ||
                      sendState !== "idle"
                    }
                    className="kora-btn kora-btn-md"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      opacity:
                        !tipAddress || !tipAmount || sendState !== "idle"
                          ? 0.6
                          : 1,
                      pointerEvents:
                        !tipAddress || !tipAmount || sendState !== "idle"
                          ? "none"
                          : "auto",
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <img
                      src="/kora_button_TIPUSER.png"
                      alt="Tip User"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            /* AIRDROP MODE */
            <motion.div
              key="airdrop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Amount per wallet */}
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
                  Amount per wallet (default)
                </label>
                <input
                  className="kora-input"
                  placeholder="e.g. 1000"
                  type="text"
                  inputMode="decimal"
                  value={airdropAmountEach}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "");
                    if (v.split(".").length <= 2) setAirdropAmountEach(v);
                  }}
                />
              </div>

              {/* Recipient List */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Users size={14} /> Recipients ({airdropEntries.length})
                </span>
                <motion.button
                  onClick={addEntry}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radius-pill)",
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--kora-lavender-dark)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Add
                </motion.button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {airdropEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      className="kora-input"
                      style={{ flex: 2, fontSize: 13, padding: "10px 14px" }}
                      placeholder="Wallet address"
                      value={entry.address}
                      onChange={(e) =>
                        updateEntry(entry.id, "address", e.target.value)
                      }
                    />
                    <input
                      className="kora-input"
                      style={{ flex: 1, fontSize: 13, padding: "10px 14px" }}
                      placeholder="Amt"
                      value={entry.amount}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, "");
                        if (v.split(".").length <= 2)
                          updateEntry(entry.id, "amount", v);
                      }}
                    />
                    {airdropEntries.length > 1 && (
                      <motion.button
                        onClick={() => removeEntry(entry.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: 4,
                        }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Airdrop Button */}
              <div style={{ marginTop: 20 }}>
                {!connected ? (
                  <motion.button
                    type="button"
                    onClick={() => connectPhantom()}
                    disabled={walletConnecting}
                    aria-busy={walletConnecting}
                    className="kora-btn kora-btn-lg"
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
                      alt="Connect Wallet"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={executeAirdrop}
                    disabled={sendState !== "idle"}
                    className="kora-btn kora-btn-md"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      opacity: sendState !== "idle" ? 0.6 : 1,
                      pointerEvents: sendState !== "idle" ? "none" : "auto",
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <img
                      src="/kora_button_primary.png"
                      alt="Send Airdrop"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {sendState === "success" && txSig && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 12,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
              }}
            >
              <CheckCircle2
                size={16}
                color="var(--kora-mint-dark)"
              />
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
          {sendState === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 12,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 13,
                color: "#ef4444",
              }}
            >
              <AlertCircle size={14} />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glowing orbs */}
        <div
          className="glow-orb glow-orb-mint"
          style={{ width: 200, height: 200, top: -60, left: -60 }}
        />
        <div
          className="glow-orb glow-orb-blue"
          style={{ width: 160, height: 160, bottom: -40, right: -40 }}
        />
      </motion.div>

      {/* Token Selector */}
      <TokenSelector
        isOpen={showTokenSelect}
        onClose={() => setShowTokenSelect(false)}
        onSelect={(t) => setToken(t)}
        selectedMint={token.mint}
      />
    </div>
  );
}
