const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

/**
 * Setup AI agents by registering them in AIAgentRegistry
 * and authorizing them in X402Integration
 */
async function main() {
    console.log("🤖 Setting up AI agents for Luminar...\n");

    // Get network from command line or default to testnet
    const network = process.argv[2] || "cronosTestnet";
    const deploymentFile = `./deployments/luminar-${network}.json`;

    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found: ${deploymentFile}`);
        console.log("Please deploy first: npm run deploy:cronos-testnet");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

    // Setup provider and signer
    const rpcUrl = network === "cronos"
        ? process.env.CRONOS_RPC_URL || "https://evm.cronos.org"
        : process.env.CRONOS_TESTNET_RPC_URL || "https://evm-t3.cronos.org";

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Deployer address:", deployer.address);
    console.log("Network:", network);
    console.log();

    // Generate AI agent wallets
    console.log("🔑 Generating AI agent wallets...");
    const milestoneAgent = ethers.Wallet.createRandom().connect(provider);
    const disputeAgent = ethers.Wallet.createRandom().connect(provider);

    console.log("Milestone Monitor Agent:", milestoneAgent.address);
    console.log("Dispute Arbitrator Agent:", disputeAgent.address);
    console.log();

    // Fund agents with gas (0.1 CRO each)
    console.log("💰 Funding agents with gas...");
    const fundAmount = ethers.parseEther("0.1");

    const tx1 = await deployer.sendTransaction({
        to: milestoneAgent.address,
        value: fundAmount
    });
    await tx1.wait();
    console.log(`✅ Funded Milestone Agent with 0.1 CRO`);

    const tx2 = await deployer.sendTransaction({
        to: disputeAgent.address,
        value: fundAmount
    });
    await tx2.wait();
    console.log(`✅ Funded Dispute Agent with 0.1 CRO`);
    console.log();

    // Connect to contracts
    const registryAbi = [
        "function registerAgent(address _agentAddress, string calldata _name, uint8 _agentType, tuple(bool canApproveMilestones, bool canResolveDisputes, bool canCreatePayments, bool canModifyEscrow) calldata _permissions) external",
        "function getAgent(address _agent) external view returns (tuple(address agentAddress, string name, uint8 agentType, tuple(bool canApproveMilestones, bool canResolveDisputes, bool canCreatePayments, bool canModifyEscrow) permissions, bool active, uint256 registeredAt, uint256 totalActions, uint256 successfulActions))"
    ];

    const x402Abi = [
        "function authorizeAgent(address _agent) external",
        "function isAgentAuthorized(address _agent) external view returns (bool)"
    ];

    const registry = new ethers.Contract(
        deployment.contracts.AIAgentRegistry,
        registryAbi,
        deployer
    );

    const x402 = new ethers.Contract(
        deployment.contracts.X402Integration,
        x402Abi,
        deployer
    );

    // Register Milestone Monitor Agent
    console.log("📝 Registering Milestone Monitor Agent...");
    const milestonePermissions = {
        canApproveMilestones: true,
        canResolveDisputes: false,
        canCreatePayments: true,
        canModifyEscrow: false
    };

    const registerTx1 = await registry.registerAgent(
        milestoneAgent.address,
        "Milestone Monitor AI",
        0, // MilestoneMonitor type
        milestonePermissions
    );
    await registerTx1.wait();
    console.log("✅ Milestone Monitor registered");

    // Register Dispute Arbitrator Agent
    console.log("📝 Registering Dispute Arbitrator Agent...");
    const disputePermissions = {
        canApproveMilestones: false,
        canResolveDisputes: true,
        canCreatePayments: true,
        canModifyEscrow: false
    };

    const registerTx2 = await registry.registerAgent(
        disputeAgent.address,
        "Dispute Arbitrator AI",
        1, // DisputeArbitrator type
        disputePermissions
    );
    await registerTx2.wait();
    console.log("✅ Dispute Arbitrator registered");
    console.log();

    // Authorize agents in X402Integration
    console.log("🔐 Authorizing agents in X402Integration...");

    const authTx1 = await x402.authorizeAgent(milestoneAgent.address);
    await authTx1.wait();
    console.log("✅ Milestone Monitor authorized in x402");

    const authTx2 = await x402.authorizeAgent(disputeAgent.address);
    await authTx2.wait();
    console.log("✅ Dispute Arbitrator authorized in x402");
    console.log();

    // Save agent credentials
    const agentConfig = {
        network,
        agents: {
            milestoneMonitor: {
                address: milestoneAgent.address,
                privateKey: milestoneAgent.privateKey,
                name: "Milestone Monitor AI",
                type: "MilestoneMonitor"
            },
            disputeArbitrator: {
                address: disputeAgent.address,
                privateKey: disputeAgent.privateKey,
                name: "Dispute Arbitrator AI",
                type: "DisputeArbitrator"
            }
        },
        contracts: deployment.contracts
    };

    const agentFile = `./agents/config-${network}.json`;
    fs.writeFileSync(agentFile, JSON.stringify(agentConfig, null, 2));
    console.log(`💾 Agent configuration saved to ${agentFile}`);

    // Add to gitignore to protect private keys
    const gitignore = fs.existsSync("./.gitignore")
        ? fs.readFileSync("./.gitignore", "utf8")
        : "";

    if (!gitignore.includes("agents/config-")) {
        fs.appendFileSync("./.gitignore", "\n# AI Agent credentials\nagents/config-*.json\n");
        console.log("✅ Added agent config to .gitignore");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 AI AGENTS SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\n🤖 Registered Agents:`);
    console.log(`\nMilestone Monitor AI`);
    console.log(`  Address: ${milestoneAgent.address}`);
    console.log(`  Permissions: Approve milestones, Create payments`);
    console.log(`\nDispute Arbitrator AI`);
    console.log(`  Address: ${disputeAgent.address}`);
    console.log(`  Permissions: Resolve disputes, Create payments`);
    console.log(`\n⚠️  IMPORTANT: Keep ${agentFile} secure!`);
    console.log(`It contains private keys for AI agents.`);
    console.log(`\n✅ Next steps:`);
    console.log(`1. Test agents: npm run test:agents`);
    console.log(`2. Update frontend with contract addresses`);
    console.log(`3. Start building demo scenarios`);
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
