export const CELO_MAINNET = {
  chainId: "0xA4EC", // 42220 in hex (Celo Mainnet)
  chainName: "Celo",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: [
    "https://forno.celo.org",
    "https://rpc.ankr.com/celo",
    "https://1rpc.io/celo",
    "https://celo.publicnode.com",
  ],
  blockExplorerUrls: ["https://celoscan.io"],
};

export const BASE_MAINNET = {
  chainId: "0x2105", // 8453 in hex (Base Mainnet)
  chainName: "Base",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

export const BASE_TESTNET = {
  chainId: "0x14A34", // 84532 in hex (Base Sepolia Testnet)
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CONTRACTS = {
  // Celo Mainnet - DEPLOYED ✅ (Updated with Rating & Arbiter Features)
  SECUREFLOW_ESCROW_MAINNET: "0x1173Bcc9183f29aFbB6f4C7E3c0b25476D3daF0F",
  CUSD_MAINNET: "0x765DE816845861e75A25fCA122bb6898B8B1282a",

  // Base Testnet - DEPLOYED ✅
  SECUREFLOW_ESCROW_TESTNET: "0xd74f3b3f4f2FF04E3eFE2B494A4BE93Eb55E7A94",
  MOCK_TOKEN_TESTNET: "0x7659C2E485D3E29dBC36f7E11de9E633ED1FDa06",

  // Default contracts (used by frontend) - Updated to Celo
  SECUREFLOW_ESCROW: "0x1173Bcc9183f29aFbB6f4C7E3c0b25476D3daF0F",
  USDC: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD on Celo
  MOCK_ERC20: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD on Celo

  BASESCAN_API_KEY: "C9CFD5REN63QS5AESUEF3WJ6EPPWJ2UN9R",
  CELOSCAN_API_KEY: "AZE1AGQSIEDRMAYGKUXFPNRHMU5YSTV4HS",
};
