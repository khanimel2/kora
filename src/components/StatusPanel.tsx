"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Coins, Cpu, RefreshCw, CircleDot, Layers, Wifi, WifiOff } from "lucide-react";
import { getKoraConfig, getPayerSigner, getSupportedTokens } from "@/lib/kora";

interface KoraNodeConfig {
  feePayers?: string[];
  supportedTokens?: string[];
  allowedPrograms?: string[];
  maxTransactionFee?: number;
  pricingModel?: string;
  enabledMethods?: string[];
}

interface PayerInfo {
  signerAddress?: string;
  paymentAddress?: string;
}

interface SupportedToken {
  mint: string;
  symbol?: string;
  decimals?: number;
}

export default function StatusPanel() {
  const [config, setConfig] = useState<KoraNodeConfig | null>(null);
  const [payer, setPayer] = useState<PayerInfo | null>(null);
  const [tokens, setTokens] = useState<SupportedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [configRes, payerRes, tokensRes] = await Promise.allSettled([
        getKoraConfig(),
        getPayerSigner(),
        getSupportedTokens(),
      ]);

      if (configRes.status === "fulfilled") {
        setConfig(configRes.value);
        setOnline(true);
      }
      if (payerRes.status === "fulfilled") {
        setPayer(payerRes.value);
      }
      if (tokensRes.status === "fulfilled") {
        setTokens(tokensRes.value || []);
      }

      // If all failed, node is offline
      if (
        configRes.status === "rejected" &&
        payerRes.status === "rejected" &&
        tokensRes.status === "rejected"
      ) {
        setOnline(false);
      }

      setLastUpdated(new Date());
    } catch {
      setOnline(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const shortAddr = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "—";

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 16,
    padding: "18px 20px",
  };

  return (
    <motion.div
      style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 14 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--kora-navy)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Activity size={20} />
            Kora Node Status
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Live configuration from your Kora paymaster node
          </p>
        </div>
        <motion.button
          onClick={fetchStatus}
          disabled={loading}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: "var(--kora-lavender-light)",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--kora-lavender-dark)",
          }}
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </div>

      {/* Connection Status */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {online === null ? (
            <CircleDot size={18} color="#AAAACC" />
          ) : online ? (
            <Wifi size={18} color="#22C55E" />
          ) : (
            <WifiOff size={18} color="#EF4444" />
          )}
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: online === null ? "#AAAACC" : online ? "#22C55E" : "#EF4444",
            }}
          >
            {online === null ? "Checking..." : online ? "Node Online" : "Node Unreachable"}
          </span>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Fee Payer */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Shield size={14} />
          Fee Payer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--text-secondary)" }}>Signer</span>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            >
              {shortAddr(payer?.signerAddress)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--text-secondary)" }}>Payment Wallet</span>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            >
              {shortAddr(payer?.paymentAddress)}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Limits */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Coins size={14} />
          Pricing & Limits
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--text-secondary)" }}>Pricing Model</span>
            <span
              style={{
                fontWeight: 700,
                color:
                  config?.pricingModel === "free"
                    ? "#22C55E"
                    : "var(--kora-lavender-dark)",
                textTransform: "capitalize",
              }}
            >
              {config?.pricingModel || "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--text-secondary)" }}>Max Tx Fee</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {config?.maxTransactionFee
                ? `${(config.maxTransactionFee / 1e9).toFixed(6)} SOL`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Supported Tokens */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Layers size={14} />
          Supported Payment Tokens ({tokens.length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tokens.length > 0 ? (
            tokens.map((t) => (
              <div
                key={t.mint}
                style={{
                  padding: "6px 12px",
                  background: "var(--kora-lavender-light)",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--kora-lavender-dark)",
                  fontFamily: "monospace",
                }}
              >
                {t.symbol || shortAddr(t.mint)}
              </div>
            ))
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {online === false ? "Node unreachable" : "Loading..."}
            </span>
          )}
        </div>
      </div>

      {/* Allowed Programs */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Cpu size={14} />
          Allowed Programs ({config?.allowedPrograms?.length || 0})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {config?.allowedPrograms && config.allowedPrograms.length > 0 ? (
            config.allowedPrograms.map((p) => (
              <div
                key={p}
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  padding: "4px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.03)",
                }}
              >
                {p}
              </div>
            ))
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {online === false ? "Node unreachable" : "Loading..."}
            </span>
          )}
        </div>
      </div>

      {/* Enabled Methods */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Activity size={14} />
          Enabled RPC Methods ({config?.enabledMethods?.length || 0})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {config?.enabledMethods && config.enabledMethods.length > 0 ? (
            config.enabledMethods.map((m) => (
              <span
                key={m}
                style={{
                  padding: "4px 10px",
                  background: "rgba(34,197,94,0.08)",
                  color: "#166534",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {m}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {online === false ? "Node unreachable" : "Loading..."}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
