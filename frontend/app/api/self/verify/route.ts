import { NextRequest, NextResponse } from "next/server";
import { CONTRACTS } from "@/lib/web3/config";
import { SECUREFLOW_ABI } from "@/lib/web3/abis";
import { ethers } from "ethers";

// Lazy-load Self Protocol Verifier to avoid build-time issues
let verifier: any = null;
let verifierError: Error | null = null;

async function getVerifier() {
  if (verifier) return verifier;
  if (verifierError) throw verifierError;
  
  try {
    // Dynamic import to avoid build-time issues
    const { SelfBackendVerifier } = await import("@selfxyz/core");
    
    verifier = new SelfBackendVerifier(
      "secureflow-identity", // Your app scope
      "", // Self Protocol doesn't require an API endpoint - proofs are verified locally
      process.env.NODE_ENV === "development", // devMode
      new Map(), // allowedIds - configure based on your needs
      null as any, // configStorage - implement based on Self Protocol docs
      "hex" // identifier type - using 'hex' since we use wallet addresses
    );
    
    return verifier;
  } catch (error: any) {
    verifierError = error;
    throw error;
  }
}

// Get Celo RPC provider
function getProvider() {
  return new ethers.JsonRpcProvider(
    process.env.CELO_RPC_URL || "https://forno.celo.org"
  );
}

// Get contract instance
function getContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACTS.SECUREFLOW_ESCROW, SECUREFLOW_ABI, provider);
}

export async function POST(request: NextRequest) {
  try {
    // Try to get raw body first to see what we're actually receiving
    const contentType = request.headers.get("content-type") || "";
    let body: any;
    
    if (contentType.includes("application/json")) {
      try {
        body = await request.json();
      } catch (parseError) {
        const text = await request.text();
        console.error("❌ Failed to parse JSON:", text.substring(0, 500));
        return NextResponse.json(
          { error: "Invalid JSON format", received: text.substring(0, 200) },
          { status: 400 }
        );
      }
    } else {
      // Try to read as text and parse
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "Invalid request format", contentType, received: text.substring(0, 200) },
          { status: 400 }
        );
      }
    }
    
    // Log the received body for debugging
    console.log("📥 Self Protocol verification request:");
    console.log("Content-Type:", contentType);
    console.log("Body keys:", Object.keys(body || {}));
    console.log("Body preview:", JSON.stringify(body).substring(0, 1000));
    
    // Self Protocol SDK sends data in specific format according to docs
    // Check all possible field name variations
    const proof = body.proof || body.Proof || body.proofData || body.proof_data;
    const pubSignals = body.pubSignals || body.pub_signals || body.publicSignals || body.public_signals;
    const userContextData = body.userContextData || body.user_context_data || body.contextData || body.context;
    const userAddress = body.userAddress || body.user_address || body.address || body.userId || body.user_id || body.identifier;
    
    // Check nested structures
    const nestedData = body.data || body.verification || body.result || body.payload;
    const nestedProof = nestedData?.proof;
    const nestedPubSignals = nestedData?.pubSignals || nestedData?.pub_signals || nestedData?.publicSignals;
    const nestedUserAddress = nestedData?.userAddress || nestedData?.user_address || nestedData?.address || nestedData?.userId;

    const finalProof = proof || nestedProof;
    const finalPubSignals = pubSignals || nestedPubSignals;
    const finalUserAddress = userAddress || nestedUserAddress;
    const finalUserContextData = userContextData || nestedData?.context || {};

    if (!finalProof || !finalPubSignals || !finalUserAddress) {
      console.error("❌ Missing required fields:");
      console.error("Body structure:", JSON.stringify(body, null, 2));
      return NextResponse.json(
        { 
          error: "Missing required fields: proof, pubSignals, userAddress",
          debug: {
            hasProof: !!finalProof,
            hasPubSignals: !!finalPubSignals,
            hasUserAddress: !!finalUserAddress,
            bodyKeys: Object.keys(body || {}),
            contentType,
            bodySample: JSON.stringify(body).substring(0, 500)
          }
        },
        { status: 400 }
      );
    }

    // Verify the proof using Self Protocol
    try {
      const selfVerifier = await getVerifier();
      
      // Determine attestation ID - check multiple possible locations
      const attestationId = finalProof.attestationId || 
                           finalProof.attestation_id || 
                           body.attestationId ||
                           body.attestation_id ||
                           "minimumAge"; // Default to minimumAge (since we request minimumAge: 18)
      
      console.log("🔍 Verifying with:", {
        attestationId,
        hasProof: !!finalProof,
        hasPubSignals: !!finalPubSignals,
        userAddress: finalUserAddress
      });
      
      const verificationResult = await selfVerifier.verify(
        attestationId,
        finalProof,
        finalPubSignals,
        finalUserContextData
      );
      
      console.log("✅ Verification result:", verificationResult);

      if (!verificationResult.valid) {
        return NextResponse.json(
          { error: "Verification failed", details: verificationResult },
          { status: 400 }
        );
      }

      // If verification is valid, update the smart contract
      // Note: In production, you should use a backend signer or admin account
      // For now, we'll return success and let the frontend handle the contract call
      // In production, implement server-side contract interaction here

      return NextResponse.json({
        success: true,
        verified: true,
        userAddress: finalUserAddress.toLowerCase(),
        timestamp: Math.floor(Date.now() / 1000),
        message: "Verification successful. Please confirm the transaction to update your status on-chain.",
      });
    } catch (verifyError: any) {
      console.error("Self Protocol verification error:", verifyError);
      return NextResponse.json(
        {
          error: "Verification failed",
          details: verifyError.message || "Unknown verification error",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Self Protocol Verification",
    endpoint: "/api/self/verify",
    contract: CONTRACTS.SECUREFLOW_ESCROW,
  });
}

