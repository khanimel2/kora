import type { Metadata } from "next";
import "./globals.css";
import { WalletProviderWrapper } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Kora — Gasless Meme Token Swapper & Tipper | Solana",
  description:
    "Swap meme tokens and tip your friends — all gasless on Solana. Powered by Kora's signing infrastructure. No SOL needed for fees.",
  keywords: [
    "Kora",
    "Solana",
    "gasless",
    "meme token",
    "swap",
    "DEX",
    "airdrop",
    "tip",
    "SPL token",
  ],
  openGraph: {
    title: "Kora — Gasless Meme Token Swapper",
    description: "Swap meme tokens gaslessly on Solana. No SOL required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
      </body>
    </html>
  );
}
