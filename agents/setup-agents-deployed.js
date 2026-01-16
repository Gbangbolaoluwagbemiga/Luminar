const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

/**
 * Setup AI Agents on Cronos Testnet
 * Creates wallets, registers agents, and saves configuration
 */
async function main() {
    console.log("🤖 Setting Up AI Agents on Cronos Testnet\n");
    console.log("=".repeat(60));

    const network = "cronosTestnet";
    const rpcUrl = process.env.CRONOS_TESTNET_RPC_URL || "https://evm-t3.cronos.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Load deployment addresses
    const deploymentFile = `./deployments/luminar-${network}.json`;
    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found: ${deploymentFile}`);
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const registryAddress = deployment.contracts.AIAgentRegistry;
    const x402Address = deployment.contracts.X402Integration;

    console.log(`\n📍 Contract Addresses:`);
    console.log(`   AI Registry: ${registryAddress}`);
    console.log(`   X402: ${x402Address}`);

    // Create or load agent wallets
    const agentConfig = {
        network: network,
        chainId: 338,
        rpcUrl: rpcUrl,
        contracts: {
            aiRegistry: registryAddress,
            x402Integration: x402Address,
        },
        agents: {},
    };

    // Generate wallets for agents
    console.log(`\n\n🔐 Generating AI Agent Wallets...`);

    const milestoneWallet = ethers.Wallet.createRandom();
    const disputeWallet = ethers.Wallet.createRandom();

    agentConfig.agents.milestoneMonitor = {
        address: milestoneWallet.address,
        privateKey: milestoneWallet.privateKey,
        name: "Milestone Monitor AI",
        agentType: 1, // Milestone type
    };

    agentConfig.agents.disputeArbitrator = {
        address: disputeWallet.address,
        privateKey: disputeWallet.privateKey,
        name: "Dispute Arbitrator AI",
        agentType: 2, // Dispute type
    };

    console.log(`   ✅ Milestone Monitor: ${milestoneWallet.address}`);
    console.log(`   ✅ Dispute Arbitrator: ${disputeWallet.address}`);

    // Save configuration
    const configFile = `./agents/config-${network}.json`;
    fs.writeFileSync(configFile, JSON.stringify(agentConfig, null, 2));
    console.log(`\n💾 Configuration saved to: ${configFile}`);

    // Add to .gitignore
    const gitignorePath = "./.gitignore";
    let gitignoreContent = fs.existsSync(gitignorePath)
        ? fs.readFileSync(gitignorePath, "utf8")
        : "";

    if (!gitignoreContent.includes("agents/config-")) {
        gitignoreContent += "\n# AI Agent private keys\nagents/config-*.json\n";
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log(`✅ Added agent configs to .gitignore`);
    }

    console.log("\n\n" + "=".repeat(60));
    console.log("⚠️  NEXT STEPS:");
    console.log("=".repeat(60));
    console.log("\n1. Fund the AI agent wallets with TCRO:");
    console.log(`   Milestone Monitor: ${milestoneWallet.address}`);
    console.log(`   Dispute Arbitrator: ${disputeWallet.address}`);
    console.log(`\n   Get TCRO from: https://cronos.org/faucet`);

    console.log("\n2. Register agents on-chain (requires funded deployer):");
    console.log(`   node agents/register-agents.js ${network}`);

    console.log("\n3. Run the demo:");
    console.log(`   node agents/demo-deployed.js ${network}`);

    console.log("\n\n✅ Agent setup complete!");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Setup error:", error);
        process.exit(1);
    });
