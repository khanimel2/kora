"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import type { TabKey } from "@/components/NavBar";
import SwapPanel from "@/components/SwapPanel";
import TipPanel from "@/components/TipPanel";
import TransferPanel from "@/components/TransferPanel";
import StatusPanel from "@/components/StatusPanel";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("swap");

  const renderPanel = () => {
    switch (activeTab) {
      case "swap":
        return <SwapPanel />;
      case "tip":
        return <TipPanel />;
      case "transfer":
        return <TransferPanel />;
      case "status":
        return <StatusPanel />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Abstract Background Elements for Premium Look */}
      <div className="kora-bg" style={{ opacity: 0.12 }} />
      <div
        className="glow-orb glow-orb-lavender"
        style={{ width: "60vw", height: "60vw", top: "-10%", left: "-10%", position: "fixed", opacity: 0.08, filter: "blur(120px)" }}
      />
      <div
        className="glow-orb glow-orb-mint"
        style={{ width: "50vw", height: "50vw", bottom: "-10%", right: "-10%", position: "fixed", opacity: 0.06, filter: "blur(100px)" }}
      />

      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Expansive Dashboard Layout */}
      <main
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          zIndex: 1,
          paddingTop: 85,
          alignItems: "stretch",
        }}
      >
        {/* Left Side: Brand, Context, and Features */}
        <section
          style={{
            flex: "1.2",
            padding: "80px 80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              style={{
                fontSize: "clamp(48px, 6vw, 84px)",
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                marginBottom: 24,
                maxWidth: 700,
              }}
            >
              The Next-Gen <br />
              <span
                style={{
                  background: "linear-gradient(135deg, var(--kora-lavender-dark), var(--kora-mint-dark))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gasless Protocol
              </span>
            </h1>

            <p
              style={{
                fontSize: "clamp(18px, 1.5vw, 22px)",
                color: "var(--text-secondary)",
                maxWidth: 600,
                lineHeight: 1.6,
                fontWeight: 400,
                marginBottom: 60,
              }}
            >
              Experience seamless, instant meme token swaps, gasless transfers, and airdrops on Solana. Zero SOL required. Institutional-grade execution wrapped in an elegant interface.
            </p>

            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "center" }}>
              {[
                { title: "Volume Traded", val: "$0.00" },
                { title: "Active Traders", val: "0" },
                { title: "Gas Saved", val: "0 SOL" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <span style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--text-muted)" }}>
                    {stat.title}
                  </span>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Outfit, sans-serif" }}>
                    {stat.val}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Mascot Decor */}
            <motion.div
              style={{ position: "absolute", bottom: -20, right: 60, opacity: 0.8 }}
              className="animate-float"
            >
              <Image src="/kora_logo.png" alt="Kora Mascot" width={180} height={180} style={{ filter: "drop-shadow(0 20px 40px rgba(139, 121, 199, 0.2))" }} />
            </motion.div>
          </motion.div>
        </section>

        {/* Right Side: The Engine (Dynamic Panel) */}
        <section
          style={{
            flex: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "40px 80px 40px 0",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 620,
              position: "relative",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: "100%" }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Decorative Border Line */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, var(--kora-lavender), var(--kora-mint), var(--kora-blue))", zIndex: 50 }} />
    </div>
  );
}
