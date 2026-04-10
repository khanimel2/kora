"use client";

import dynamic from "next/dynamic";
import React from "react";

const WalletProviderWrapper = dynamic(
  () =>
    import("@/components/WalletProvider").then(
      (mod) => mod.WalletProviderWrapper
    ),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProviderWrapper>{children}</WalletProviderWrapper>;
}
