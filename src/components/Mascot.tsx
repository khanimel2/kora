"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = [
  "💡 All swaps are gasless — you never need SOL for fees!",
  "🎉 Kora pays your transaction fees using a tiny bit of the swapped token.",
  "🔒 Your wallet, your keys — Kora never touches your funds.",
  "⚡ Powered by Solana — swaps settle in under a second!",
  "🪙 You can also tip friends with any meme token, gaslessly!",
  "🚀 Try the Airdrop feature to send tokens to multiple wallets at once!",
  "💜 Welcome to Kora! I'm here to help you swap meme tokens.",
  "✨ Pro tip: Use USDC to cover fees if you want to keep all your meme tokens!",
];

interface MascotProps {
  mood?: "idle" | "happy" | "thinking" | "celebrating";
  message?: string;
  size?: number;
}

export default function Mascot({
  mood = "idle",
  message,
  size = 120,
}: MascotProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    if (message) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
      setShowBubble(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [message]);

  const displayMsg = message || TIPS[tipIndex];

  const getAnimation = () => {
    switch (mood) {
      case "happy":
        return {
          animate: {
            y: [0, -15, 0, -8, 0],
            rotate: [0, -5, 5, -3, 0],
            scale: [1, 1.08, 1, 1.04, 1],
          },
          transition: { duration: 1.2, ease: "easeInOut" as const },
        };
      case "celebrating":
        return {
          animate: {
            y: [0, -25, 0, -20, 0, -10, 0],
            rotate: [0, -10, 10, -8, 8, -4, 0],
            scale: [1, 1.15, 0.95, 1.1, 0.97, 1.05, 1],
          },
          transition: { duration: 1.5, ease: "easeInOut" as const },
        };
      case "thinking":
        return {
          animate: {
            rotate: [0, 3, -3, 2, 0],
            y: [0, -3, 0],
          },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
        };
      default:
        return {
          animate: {
            y: [0, -8, 0],
            rotate: [0, -2, 2, 0],
          },
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
        };
    }
  };

  const anim = getAnimation();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {showBubble && (
          <motion.div
            key={displayMsg}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="speech-bubble"
            style={{ textAlign: "center" }}
          >
            {displayMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Image */}
      <motion.div
        {...anim}
        style={{ cursor: "pointer", position: "relative" }}
        onClick={() => {
          setTipIndex((prev) => (prev + 1) % TIPS.length);
          setShowBubble(true);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, rotate: 10 }}
      >
        {/* Pulse ring behind mascot */}
        {mood === "celebrating" && (
          <>
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                border: "3px solid var(--kora-lavender)",
                animation: "pulse-ring 1.5s ease-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -35,
                borderRadius: "50%",
                border: "2px solid var(--kora-mint)",
                animation: "pulse-ring 1.5s ease-out infinite 0.5s",
              }}
            />
          </>
        )}
        <Image
          src="/kora_logo.png"
          alt="Kora Mascot"
          width={size}
          height={size}
          style={{
            filter: "drop-shadow(0 8px 24px rgba(139, 121, 199, 0.35))",
          }}
          priority
        />
      </motion.div>
    </div>
  );
}
