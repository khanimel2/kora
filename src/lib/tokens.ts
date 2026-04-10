export interface TokenInfo {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoURI: string;
  coingeckoId?: string;
}

export const POPULAR_TOKENS: TokenInfo[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    coingeckoId: "solana",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    coingeckoId: "usd-coin",
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    coingeckoId: "bonk",
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    logoURI: "https://bafkreibk3covs5ltyqxa272uodhculbr6kea6betiber557wrze3lgfuace.ipfs.nftstorage.link",
    coingeckoId: "dogwifcoin",
  },
  {
    symbol: "POPCAT",
    name: "Popcat",
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    decimals: 9,
    logoURI: "https://bafkreig44k5ffkfm54gljhoyygvkmgakho7quqxcvwgcraapfsc7wih4ii.ipfs.nftstorage.link/",
    coingeckoId: "popcat",
  },
  {
    symbol: "MEW",
    name: "cat in a dogs world",
    mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    decimals: 5,
    logoURI: "https://bafkreidlwyr565dxtao2ipsze6bmzpszqzybz7sqi2zaet5fs7k53henju.ipfs.nftstorage.link/",
    coingeckoId: "cat-in-a-dogs-world",
  },
  {
    symbol: "MYRO",
    name: "Myro",
    mint: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4",
    decimals: 9,
    logoURI: "https://bafkreiey5fwwpvds3idvqbcfnlqcscucjqsmtqflqhpqhbzb5bpj7z357a.ipfs.nftstorage.link/",
    coingeckoId: "myro",
  },
  {
    symbol: "SLERF",
    name: "Slerf",
    mint: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3",
    decimals: 9,
    logoURI: "https://bafkreih44o4gf2jbhpesqpsvqek3f6stgmbhblgfisqm4jhxnlhghs7boa.ipfs.nftstorage.link/",
    coingeckoId: "slerf",
  },
];

export const FEE_TOKEN_OPTIONS: TokenInfo[] = [
  POPULAR_TOKENS[1], // USDC
  POPULAR_TOKENS[2], // BONK
];

// Jupiter Swap API v2 base
export const JUPITER_API_BASE = "https://api.jup.ag";

// Kora RPC endpoint (configure via env)
export const KORA_RPC_URL =
  process.env.NEXT_PUBLIC_KORA_RPC || "https://kora.example.com";
