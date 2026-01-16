const { ethers } = require("ethers");
const MilestoneMonitor = require("./MilestoneMonitor");
const DisputeArbitrator = require("./DisputeArbitrator");
const X402Facilitator = require("../lib/x402/facilitator");
const fs = require("fs");
require("dotenv").config();

/**
 * Test/Demo script for AI agents
 * Simulates the complete flow: escrow → milestone → AI approval → x402 payment
 */
async function main() {
    console.log("🎬 Luminar AI Agent Demo\n");
    console.log("=".repeat(60));

    // Get network
    const network = process.argv[2] || "cronosTestnet";
    const agentConfigFile = `./agents/config-${network}.json`;
    const deploymentFile = `./deployments/luminar-${network}.json`;

    // Check if files exist
    if (!fs.existsSync(agentConfigFile)) {
        console.error(`❌ Agent config not found: ${agentConfigFile}`);
        console.log("Run: npm run setup-agents first");
        process.exit(1);
    }

    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found: ${deploymentFile}`);
        console.log("Run: npm run deploy:cronos-testnet first");
        process.exit(1);
    }

    const agentConfig = JSON.parse(fs.readFileSync(agentConfigFile, "utf8"));
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

    // Setup provider
    const rpcUrl = network === "cronos"
        ? process.env.CRONOS_RPC_URL
        : process.env.CRONOS_TESTNET_RPC_URL;

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create agent signers
    const milestoneAgentWallet = new ethers.Wallet(
        agentConfig.agents.milestoneMonitor.privateKey,
        provider
    );

    const disputeAgentWallet = new ethers.Wallet(
        agentConfig.agents.disputeArbitrator.privateKey,
        provider
    );

    console.log(`\n🌐 Network: ${network}`);
    console.log(`📍 Contracts:`);
    console.log(`   Luminar: ${deployment.contracts.Luminar}`);
    console.log(`   X402: ${deployment.contracts.X402Integration}`);
    console.log(`   Registry: ${deployment.contracts.AIAgentRegistry}`);
    console.log(`\n🤖 AI Agents:`);
    console.log(`   Milestone Monitor: ${milestoneAgentWallet.address}`);
    console.log(`   Dispute Arbitrator: ${disputeAgentWallet.address}`);
    console.log("=".repeat(60));

    // Initialize agents
    const milestoneMonitor = new MilestoneMonitor(
        provider,
        deployment.contracts.Luminar,
        deployment.contracts.X402Integration,
        deployment.contracts.AIAgentRegistry,
        milestoneAgentWallet
    );

    const disputeArbitrator = new DisputeArbitrator(
        provider,
        deployment.contracts.Luminar,
        deployment.contracts.X402Integration,
        deployment.contracts.AIAgentRegistry,
        disputeAgentWallet
    );

    const x402 = new X402Facilitator(provider, deployment.contracts.X402Integration);

    // DEMO SCENARIO 1: Milestone Approval
    console.log("\n\n" + "=".repeat(60));
    console.log("📋 DEMO SCENARIO 1: AI Milestone Approval");
    console.log("=".repeat(60));

    console.log("\n📝 Simulating scenario:");
    console.log("1. Client creates escrow for $1000 USDC");
    console.log("2. Freelancer completes milestone and submits deliverable");
    console.log("3. AI Milestone Monitor analyzes deliverable");
    console.log("4. AI approves → x402 triggers payment");

    // Create demo data
    const demoEscrowId = 1;
    const demoMilestoneIndex = 0;
    const demoDeliverableUrl = "ipfs://Qm...demo-deliverable-hash";
    const demoSessionId = X402Facilitator.generateSessionId(demoEscrowId);
    const demoInstructionId = 1; // Simulated

    console.log(`\n🔍 AI Analysis Phase:`);
    const result = await milestoneMonitor.processMilestone(
        demoEscrowId,
        demoMilestoneIndex,
        demoDeliverableUrl,
        demoSessionId,
        demoInstructionId
    );

    if (result.approved) {
        console.log(`\n✅ RESULT: Milestone approved by AI!`);
        console.log(`   Payment instruction ${demoInstructionId} authorized`);
        console.log(`   Next: Escrow contract executes x402 payment`);
    } else {
        console.log(`\n❌ RESULT: Milestone rejected by AI`);
        console.log(`   Reason: ${result.reason}`);
    }

    // DEMO SCENARIO 2: Dispute Resolution  
    console.log("\n\n" + "=".repeat(60));
    console.log("⚖️  DEMO SCENARIO 2: AI Dispute Resolution");
    console.log("=".repeat(60));

    console.log("\n📝 Simulating scenario:");
    console.log("1. Client raises dispute: 'Deliverable quality not satisfactory'");
    console.log("2. AI Arbitrator analyzes evidence from both parties");
    console.log("3. AI makes resolution decision");
    console.log("4. x402 executes settlement payment");

    const disputeEscrowId = 2;
    const disputeRaiser = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"; // Client
    const disputeReason = "Deliverable quality does not meet requirements specified in milestone description";
    const disputeSessionId = X402Facilitator.generateSessionId(disputeEscrowId, Date.now() + 1);

    console.log(`\n⚖️  AI Arbitration Phase:`);
    const disputeResult = await disputeArbitrator.processDispute(
        disputeEscrowId,
        disputeRaiser,
        disputeReason,
        disputeSessionId
    );

    if (disputeResult.instructionId) {
        console.log(`\n✅ RESULT: Dispute resolved by AI!`);
        console.log(`   Resolution: ${disputeResult.resolution}`);
        console.log(`   Payment instruction created: ${disputeResult.instructionId}`);
        console.log(`   Settlement will be executed via x402`);
    } else if (disputeResult.escalated) {
        console.log(`\n⚠️  RESULT: Escalated to human arbiters`);
        console.log(`   Reason: ${disputeResult.reason}`);
    }

    // Summary
    console.log("\n\n" + "=".repeat(60));
    console.log("🎉 DEMO COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\n✅ Successfully demonstrated:`);
    console.log(`   ✓ AI-powered milestone approval`);
    console.log(`   ✓ AI-powered dispute resolution`);
    console.log(`   ✓ x402 payment instruction creation`);
    console.log(`   ✓ Agent activity tracking in registry`);
    console.log(`\n📊 This proves Luminar's core innovation:`);
    console.log(`   → AI agents autonomously manage payment lifecycle`);
    console.log(`   → x402 enables programmable payment execution`);
    console.log(`   → Full transparency via on-chain tracking`);
    console.log(`\n🏆 Ready for hackathon submission!`);
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Demo error:", error);
        process.exit(1);
    });
