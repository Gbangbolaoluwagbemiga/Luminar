import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Web3Provider } from "@/contexts/web3-context";
import { SmartAccountProvider } from "@/contexts/smart-account-context";
import { DelegationProvider } from "@/contexts/delegation-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { SelfVerificationProvider } from "@/contexts/self-verification-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppKit } from "@/lib/web3/reown-config";
import { FarcasterSDKProvider } from "@/components/farcaster-sdk-provider";

export const metadata: Metadata = {
  title: "Luminar - AI-Powered Escrow on Cronos",
  description: "AI agents autonomously manage freelance payments using x402 agentic rails on Cronos EVM",
  generator: "Luminar",
  manifest: "/manifest.json",
  icons: {
    icon: "/luminar-favicon.png",
    apple: "/luminar-favicon.png",
    shortcut: "/luminar-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/luminar-favicon.png"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/luminar-favicon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Farcaster Mini App Embed Metadata */}
        <meta
          name="fc:miniapp"
          content='{
          "version":"next",
          "imageUrl":"https://luminar.app/luminar-logo.png",
          "button":{
            "title":"Launch Luminar",
            "action":{
              "type":"launch_miniapp",
              "name":"Luminar",
              "url":"https://luminar.app"
            }
          }
        }'
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FarcasterSDKProvider>
            <AppKit>
              <Suspense fallback={<div>Loading...</div>}>
                <Web3Provider>
                  <DelegationProvider>
                    <SmartAccountProvider>
                      <NotificationProvider>
                        <SelfVerificationProvider>
                          <Navbar />
                          <main className="pt-16">{children}</main>
                          <Toaster />
                        </SelfVerificationProvider>
                      </NotificationProvider>
                    </SmartAccountProvider>
                  </DelegationProvider>
                </Web3Provider>
              </Suspense>
            </AppKit>
          </FarcasterSDKProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
