"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";

export type TabKey = "swap" | "tip" | "transfer" | "status";

interface NavBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "swap", label: "Swap" },
  { key: "tip", label: "Tip" },
  { key: "transfer", label: "Transfer" },
  { key: "status", label: "Status" },
];

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [showMenu, setShowMenu] = useState(false);

  const shortAddr = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        zIndex: 100,
        background: "rgba(252, 252, 255, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border-glass)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Logo */}
        <motion.div
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flexShrink: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Image
            src="/kora_logo.png"
            alt="Kora"
            width={40}
            height={40}
            style={{ borderRadius: 10, width: "auto", height: 40 }}
            className="animate-wobble"
          />
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--kora-navy)",
              letterSpacing: "-0.03em",
            }}
          >
            KORA
          </span>
        </motion.div>

        {/* Center — Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(0,0,0,0.03)",
            borderRadius: 9999,
            padding: 4,
          }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "10px 22px",
                borderRadius: 9999,
                border: "none",
                background: activeTab === tab.key ? "var(--kora-lavender)" : "transparent",
                color: activeTab === tab.key ? "#FFFFFF" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Right side — Telegram + Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          {/* Telegram Button */}
          <motion.a
            href="https://t.me/korameme"
            target="_blank"
            rel="noopener noreferrer"
            className="kora-btn kora-btn-nav"
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <img
              src="/kora_button_telegram.png"
              alt="Join Telegram"
              style={{ width: "180px", height: "auto" }}
            />
          </motion.a>

          {/* Wallet */}
          {connected ? (
            <div style={{ position: "relative" }}>
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  padding: "10px 22px",
                  border: "2px solid var(--kora-lavender)",
                  background: "rgba(255,255,255,0.85)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--kora-navy)",
                  backdropFilter: "blur(12px)",
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#4ADE80",
                    boxShadow: "0 0 10px #4ADE80",
                  }}
                />
                {shortAddr}
              </motion.button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      padding: 8,
                      minWidth: 180,
                      zIndex: 200,
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                    }}
                  >
                    <button
                      onClick={() => {
                        disconnect();
                        setShowMenu(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 18px",
                        borderRadius: 10,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#0A0A14",
                        textAlign: "left",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F4F4F8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => setVisible(true)}
              className="kora-btn kora-btn-nav"
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.94 }}
            >
              <img
                src="/kora_button_connect_wallet.png"
                alt="Connect Wallet"
                style={{ width: "180px", height: "auto" }}
              />
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
