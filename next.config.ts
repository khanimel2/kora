import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "arweave.net" },
      { protocol: "https", hostname: "**.ipfs.nftstorage.link" },
      { protocol: "https", hostname: "bafkreibk3covs5ltyqxa272uodhculbr6kea6betiber557wrze3lgfuace.ipfs.nftstorage.link" },
      { protocol: "https", hostname: "bafkreig44k5ffkfm54gljhoyygvkmgakho7quqxcvwgcraapfsc7wih4ii.ipfs.nftstorage.link" },
      { protocol: "https", hostname: "bafkreidlwyr565dxtao2ipsze6bmzpszqzybz7sqi2zaet5fs7k53henju.ipfs.nftstorage.link" },
      { protocol: "https", hostname: "bafkreiey5fwwpvds3idvqbcfnlqcscucjqsmtqflqhpqhbzb5bpj7z357a.ipfs.nftstorage.link" },
      { protocol: "https", hostname: "bafkreih44o4gf2jbhpesqpsvqek3f6stgmbhblgfisqm4jhxnlhghs7boa.ipfs.nftstorage.link" },
      { protocol: "https", hostname: "**.arweave.net" },
      { protocol: "https", hostname: "shdw-drive.genesysgo.net" },
      { protocol: "https", hostname: "cf-ipfs.com" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
