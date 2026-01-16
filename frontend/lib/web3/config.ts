/**
 * Cronos Network Configuration for Luminar
 * Updated for Cronos x402 Paytech Hackathon
 */

// Cronos Mainnet Configuration
export const CRONOS_MAINNET = {
  chainId: "0x19", // 25 in decimal
  chainName: "Cronos Mainnet",
  nativeCurrency: {
    name: "Cronos",
    symbol: "CRO",
    decimals: 18,
  },
  rpcUrls: ["https://evm.cronos.org"],
  blockExplorerUrls: ["https://cronoscan.com"],
};

// Cronos Testnet Configuration
export const CRONOS_TESTNET = {
  chainId: "0x152", // 338 in decimal
  chainName: "Cronos Testnet",
  nativeCurrency: {
    name: "Test Cronos",
    symbol: "TCRO",
    decimals: 18,
  },
  rpcUrls: ["https://evm-t3.cronos.org"],
  blockExplorerUrls: ["https://testnet.cronoscan.com"],
};

// Contract addresses (will be updated after deployment)
export const CONTRACTS = {
  LUMINAR: process.env.NEXT_PUBLIC_LUMINAR_CONTRACT || "0x0000000000000000000000000000000000000000",
  X402_INTEGRATION: process.env.NEXT_PUBLIC_X402_CONTRACT || "0x0000000000000000000000000000000000000000",
  AI_AGENT_REGISTRY: process.env.NEXT_PUBLIC_AI_REGISTRY_CONTRACT || "0x0000000000000000000000000000000000000000",

  //Legacy SecureFlow address for backward compat
  SECUREFLOW_ESCROW: process.env.NEXT_PUBLIC_LUMINAR_CONTRACT || "0x0000000000000000000000000000000000000000",
};

// Token addresses on Cronos
export const TOKENS = {
  WCRO: process.env.NEXT_PUBLIC_WCRO_ADDRESS || "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
  USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x66e428c3f67a68878562e79A0234c1F83c208770",
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Current network (change to CRONOS_TESTNET for testing)
export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_USE_MAINNET === "true"
  ? CRONOS_MAINNET
  : CRONOS_TESTNET;

// x402 Configuration
export const X402_CONFIG = {
  ENABLED: process.env.NEXT_PUBLIC_X402_ENABLED === "true",
  FACILITATOR_URL: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || "",
};

// AI Agent Configuration
export const AI_CONFIG = {
  MILESTONE_MONITOR: process.env.NEXT_PUBLIC_MILESTONE_AGENT || "",
  DISPUTE_ARBITRATOR: process.env.NEXT_PUBLIC_DISPUTE_AGENT || "",
};

// Legacy Celo exports for backward compatibility during migration
// Remove these once all components are updated
export const CELO_MAINNET = CRONOS_MAINNET;
export const CELO_TESTNET = CRONOS_TESTNET;
