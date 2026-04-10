"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 24px 20px",
        position: "relative",
      }}
    >
      {/* Floating mascot */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          damping: 12,
          stiffness: 100,
          delay: 0.1,
        }}
        className="animate-float"
      >
        <Image
          src="/kora_logo.png"
          alt="Kora Mascot"
          width={140}
          height={140}
          style={{
            filter: "drop-shadow(0 12px 30px rgba(139, 121, 199, 0.4))",
          }}
          priority
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: 900,
          color: "var(--kora-navy)",
          lineHeight: 1.1,
          marginTop: 16,
          maxWidth: 600,
        }}
      >
        Swap Meme Tokens{" "}
        <span
          style={{
            background:
              "linear-gradient(135deg, var(--kora-lavender), var(--kora-mint))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Gaslessly
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          fontSize: "clamp(15px, 2vw, 18px)",
          color: "var(--text-secondary)",
          maxWidth: 500,
          marginTop: 14,
          lineHeight: 1.6,
          fontWeight: 400,
        }}
      >
        No SOL needed. Kora handles your fees. Swap, tip, and airdrop your
        favorite meme coins on Solana — totally free.
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { icon: <Zap size={14} />, text: "Zero Gas Fees" },
          { icon: <Shield size={14} />, text: "Non-Custodial" },
          { icon: <Sparkles size={14} />, text: "Instant Swaps" },
        ].map((item, i) => (
          <motion.div
            key={item.text}
            className="glass-card"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-pill)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--kora-navy)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <span style={{ color: "var(--kora-lavender-dark)" }}>
              {item.icon}
            </span>
            {item.text}
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{ marginTop: 28, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
      >
        <motion.button
          onClick={onGetStarted}
          className="kora-btn kora-btn-xl"
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/kora_button_primary.png"
            alt="Swap Now"
            width={320}
            height={80}
            style={{ width: "auto", height: 80 }}
          />
        </motion.button>
        <motion.a
          href="https://x.com/Kora_Solana"
          target="_blank"
          rel="noopener noreferrer"
          className="kora-btn kora-btn-xl"
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/x_button_matching.png"
            alt="Follow on X"
            width={320}
            height={80}
            style={{ width: "auto", height: 80 }}
          />
        </motion.a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          fontSize: 12,
          cursor: "pointer",
        }}
        onClick={onGetStarted}
      >
        <span>Start Swapping</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight
            size={16}
            style={{ transform: "rotate(90deg)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
