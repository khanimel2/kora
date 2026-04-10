"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { POPULAR_TOKENS, TokenInfo } from "@/lib/tokens";

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
  selectedMint?: string;
}

export default function TokenSelector({
  isOpen,
  onClose,
  onSelect,
  selectedMint,
}: TokenSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = POPULAR_TOKENS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 10, 20, 0.6)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          {/* Modal — fully opaque, solid white */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{
              width: "min(460px, 92vw)",
              maxHeight: "75vh",
              zIndex: 501,
              padding: 0,
              overflow: "hidden",
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 32px 80px rgba(10, 10, 20, 0.2), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 28px 18px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <h3
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0A0A14",
                }}
              >
                Select Token
              </h3>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "#F4F4F8",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "50%",
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#5F5E7B",
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Search */}
            <div style={{ padding: "14px 28px" }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9594A8",
                  }}
                />
                <input
                  style={{
                    width: "100%",
                    padding: "14px 18px 14px 46px",
                    background: "#F8F8FC",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 12,
                    fontSize: 15,
                    color: "#0A0A14",
                    outline: "none",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                  placeholder="Search by name or symbol..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Popular chips */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "0 28px 14px",
                flexWrap: "wrap",
              }}
            >
              {POPULAR_TOKENS.slice(0, 5).map((token) => (
                <motion.button
                  key={token.mint}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 9999,
                    border:
                      token.mint === selectedMint
                        ? "2px solid #8B79C7"
                        : "1px solid rgba(0,0,0,0.08)",
                    background:
                      token.mint === selectedMint ? "#F0EDFA" : "#FAFAFA",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0A0A14",
                  }}
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
                </motion.button>
              ))}
            </div>

            {/* Token List */}
            <div
              style={{
                overflowY: "auto",
                maxHeight: 320,
                padding: "0 14px 14px",
              }}
            >
              {filtered.map((token, i) => (
                <motion.button
                  key={token.mint}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ background: "#F4F4F8" }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "none",
                    background:
                      token.mint === selectedMint ? "#F0EDFA" : "transparent",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                >
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%" }}
                    unoptimized
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#0A0A14",
                      }}
                    >
                      {token.symbol}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#9594A8",
                        fontWeight: 400,
                      }}
                    >
                      {token.name}
                    </div>
                  </div>
                  {token.mint === selectedMint && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#8B79C7",
                      }}
                    />
                  )}
                </motion.button>
              ))}
              {filtered.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "#9594A8",
                    fontSize: 14,
                  }}
                >
                  No tokens found
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
