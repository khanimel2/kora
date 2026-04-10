"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "0 32px",
        height: 72,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(252, 252, 255, 0.95)",
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Left Side: Logo + Copyright */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
            whileHover={{ scale: 1.03 }}
          >
            <Image
              src="/kora_logo.png"
              alt="Kora"
              width={32}
              height={32}
              style={{ borderRadius: 8, width: "auto", height: 32 }}
            />
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: "var(--kora-navy)",
              }}
            >
              KORA
            </span>
          </motion.div>
          
          <div style={{ width: 1, height: 24, background: "var(--border-glass)" }} />
          
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Built with{" "}
            <Heart size={12} fill="var(--kora-lavender)" color="var(--kora-lavender)" />{" "}
            on Solana
          </span>
        </div>

        {/* Center: Text Links */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          {[
            { label: "Docs", href: "https://launch.solana.com/docs/kora" },
            { label: "GitHub", href: "https://github.com/solana-foundation/kora" },
            { label: "Telegram", href: "https://t.me/korameme" },
            { label: "Solscan", href: "https://solscan.io" },
            { label: "API", href: "https://launch.solana.com/docs/kora/json-rpc-api" },
          ].map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              whileHover={{ color: "var(--kora-lavender-dark)", y: -1 }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Right Side: PNG Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <motion.a href="https://launch.solana.com/docs/kora" target="_blank" className="kora-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <img src="/kora_button_primary.png" alt="Docs" style={{ width: 140, height: "auto" }} />
          </motion.a>
          <motion.a href="https://t.me/korameme" target="_blank" className="kora-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <img src="/kora_button_telegram.png" alt="Telegram" style={{ width: 140, height: "auto" }} />
          </motion.a>
          <motion.a href="https://github.com/solana-foundation/kora" target="_blank" className="kora-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <img src="/kora_button_connect_wallet.png" alt="GitHub" style={{ width: 140, height: "auto" }} />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
