const hre = require("hardhat");
require("dotenv").config();

/**
 * Deploy Luminar to Cronos EVM
 * Deploys: AIAgentRegistry, X402Integration, and Luminar main contract
 */
async function main() {
    console.log("🚀 Deploying Luminar to Cronos EVM...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CRO\n");

    // Configuration
    const network = hre.network.name;
    const isTestnet = network === "cronosTestnet";

    // Token addresses on Cronos
    const CRONOS_TOKENS = {
        mainnet: {
            WCRO: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
            USDC: "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
            USDT: "0x66e428c3f67a68878562e79A0234c1F83c208770"
        },
        testnet: {
            // Testnet addresses (will use devUSDC.e)
            WCRO: "0x0000000000000000000000000000000000000000", // Use native CRO
            USDC: "0x0000000000000000000000000000000000000000", // Will get from faucet
            USDT: "0x0000000000000000000000000000000000000000"
        }
    };

    const tokens = isTestnet ? CRONOS_TOKENS.testnet : CRONOS_TOKENS.mainnet;
    const feeCollector = deployer.address; // For hackathon, deployer is fee collector
    const platformFeeBP = 250; // 2.5% platform fee

    // Step 1: Deploy AIAgentRegistry
    console.log("📝 Deploying AIAgentRegistry...");
    const AIAgentRegistry = await hre.ethers.getContractFactory("AIAgentRegistry");
    const agentRegistry = await AIAgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("✅ AIAgentRegistry deployed to:", agentRegistryAddress);

    // Step 2: Deploy X402Integration
    console.log("\n📝 Deploying X402Integration...");
    const X402Integration = await hre.ethers.getContractFactory("X402Integration");
    const x402Integration = await X402Integration.deploy();
    await x402Integration.waitForDeployment();
    const x402Address = await x402Integration.getAddress();
    console.log("✅ X402Integration deployed to:", x402Address);

    // Step 3: Deploy Luminar main contract
    console.log("\n📝 Deploying Luminar main contract...");
    const Luminar = await hre.ethers.getContractFactory("Luminar");
    const luminar = await Luminar.deploy(
        tokens.WCRO, // Initial whitelisted token (can be address(0) for native CRO)
        feeCollector,
        platformFeeBP
    );
    await luminar.waitForDeployment();
    const luminarAddress = await luminar.getAddress();
    console.log("✅ Luminar deployed to:", luminarAddress);

    // Step 4: Configure integrations
    console.log("\n⚙️ Configuring integrations...");

    // Set x402 integration
    const setX402Tx = await luminar.setX402Integration(x402Address);
    await setX402Tx.wait();
    console.log("✅ X402 integration configured");

    // Set AI registry
    const setRegistryTx = await luminar.setAIRegistry(agentRegistryAddress);
    await setRegistryTx.wait();
    console.log("✅ AI registry configured");

    // Trust Luminar contract in X402Integration
    const trustEscrowTx = await x402Integration.trustEscrow(luminarAddress);
    await trustEscrowTx.wait();
    console.log("✅ Luminar trusted in X402Integration");

    // Step 5: Whitelist tokens (if on mainnet)
    if (!isTestnet) {
        console.log("\n💰 Whitelisting tokens...");

        if (tokens.USDC !== "0x0000000000000000000000000000000000000000") {
            const whitelistUSDC = await luminar.whitelistToken(tokens.USDC);
            await whitelistUSDC.wait();
            console.log("✅ USDC whitelisted");
        }

        if (tokens.USDT !== "0x0000000000000000000000000000000000000000") {
            const whitelistUSDT = await luminar.whitelistToken(tokens.USDT);
            await whitelistUSDT.wait();
            console.log("✅ USDT whitelisted");
        }
    }

    // Step 6: Save deployment info
    const deployment = {
        network: network,
        chainId: isTestnet ? 338 : 25,
        timestamp: new Date().toISOString(),
        contracts: {
            Luminar: luminarAddress,
            X402Integration: x402Address,
            AIAgentRegistry: agentRegistryAddress
        },
        tokens: tokens,
        config: {
            feeCollector: feeCollector,
            platformFeeBP: platformFeeBP
        },
        deployer: deployer.address
    };

    const fs = require("fs");
    const deploymentFile = `./deployments/luminar-${network}.json`;

    // Create deployments directory if it doesn't exist
    if (!fs.existsSync("./deployments")) {
        fs.mkdirSync("./deployments");
    }

    fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
    console.log(`\n💾 Deployment info saved to ${deploymentFile}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log(`Network: ${network} (Chain ID: ${deployment.chainId})`);
    console.log(`\n📝 Contract Addresses:`);
    console.log(`Luminar:          ${luminarAddress}`);
    console.log(`X402Integration:  ${x402Address}`);
    console.log(`AIAgentRegistry:  ${agentRegistryAddress}`);
    console.log(`\n🔍 Explorer URLs:`);
    const explorerBase = isTestnet
        ? "https://testnet.cronoscan.com"
        : "https://cronoscan.com";
    console.log(`Luminar:          ${explorerBase}/address/${luminarAddress}`);
    console.log(`X402Integration:  ${explorerBase}/address/${x402Address}`);
    console.log(`AIAgentRegistry:  ${explorerBase}/address/${agentRegistryAddress}`);
    console.log("\n✅ Next steps:");
    console.log("1. Verify contracts: npm run verify:cronos");
    console.log("2. Set up AI agents: npm run setup-agents");
    console.log("3. Update frontend .env with contract addresses");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
