"use client";

import React from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { ethers } from "ethers";

// Get projectId from environment
export const projectId =
  process.env.NEXT_PUBLIC_REOWN_ID || "1db88bda17adf26df9ab7799871788c4";

// Create metadata
export const metadata = {
  name: "Luminar",
  description: "AI-Powered Escrow on Cronos with x402 Agentic Payments",
  url: typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://luminar.app",
  icons: ["/luminar-logo.png"],
};

// Define Cronos networks
const networks = [
  {
    id: 338, // Cronos Testnet
    name: "Cronos Testnet",
    currency: "TCRO",
    explorerUrl: "https://testnet.cronoscan.com",
    rpcUrl: "https://evm-t3.cronos.org",
  },
  {
    id: 25, // Cronos Mainnet
    name: "Cronos Mainnet",
    currency: "CRO",
    explorerUrl: "https://cronoscan.com",
    rpcUrl: "https://evm.cronos.org",
  },
];

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: networks as any,
  projectId,
  features: {
    analytics: true,
  },
});

export function AppKit({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
