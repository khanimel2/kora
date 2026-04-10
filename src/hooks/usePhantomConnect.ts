"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";

export const PHANTOM_DOWNLOAD_URL = "https://phantom.app/download";

function isPhantomInjected(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & {
    phantom?: { solana?: { isPhantom?: boolean } };
    solana?: { isPhantom?: boolean };
  };
  return !!(w.phantom?.solana?.isPhantom || w.solana?.isPhantom);
}

/**
 * One-click Phantom: selects the Phantom adapter and calls connect(), which
 * triggers the extension popup (standard `wallet.connect()` flow).
 */
export function usePhantomConnect() {
  const { wallets, wallet, select, connect, connecting, connected } = useWallet();
  const pendingSelectConnectRef = useRef(false);

  const connectPhantom = useCallback(() => {
    const phantom = wallets.find((w) => w.adapter.name === PhantomWalletName);
    if (!phantom) {
      window.open(PHANTOM_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
      return;
    }

    const { readyState } = phantom;
    const injected = isPhantomInjected();

    if (
      !injected &&
      (readyState === WalletReadyState.NotDetected ||
        readyState === WalletReadyState.Unsupported)
    ) {
      window.open(PHANTOM_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if (wallet?.adapter.name === PhantomWalletName) {
      void connect().catch(() => {});
      return;
    }

    pendingSelectConnectRef.current = true;
    select(PhantomWalletName);
  }, [wallets, wallet, select, connect]);

  useEffect(() => {
    if (!pendingSelectConnectRef.current) return;
    if (!wallet || wallet.adapter.name !== PhantomWalletName) return;

    const { readyState } = wallet;
    if (readyState === WalletReadyState.NotDetected) return;

    pendingSelectConnectRef.current = false;

    if (
      readyState === WalletReadyState.Installed ||
      readyState === WalletReadyState.Loadable
    ) {
      void connect().catch(() => {});
    } else {
      window.open(PHANTOM_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
    }
  }, [wallet, connect]);

  return { connectPhantom, connecting, connected };
}
