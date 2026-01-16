const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

/**
 * Verify deployed contracts on Cronos Explorer
 */
async function main() {
    const network = hre.network.name;
    const deploymentFile = `./deployments/luminar-${network}.json`;

    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found: ${deploymentFile}`);
        console.log("Please deploy first: npm run deploy:cronos-testnet or deploy:cronos");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log(`🔍 Verifying contracts on ${network}...\n`);

    // Verify AIAgentRegistry
    console.log("Verifying AIAgentRegistry...");
    try {
        await hre.run("verify:verify", {
            address: deployment.contracts.AIAgentRegistry,
            constructorArguments: [],
        });
        console.log("✅ AIAgentRegistry verified\n");
    } catch (error) {
        console.log("⚠️ AIAgentRegistry verification failed:", error.message, "\n");
    }

    // Verify X402Integration
    console.log("Verifying X402Integration...");
    try {
        await hre.run("verify:verify", {
            address: deployment.contracts.X402Integration,
            constructorArguments: [],
        });
        console.log("✅ X402Integration verified\n");
    } catch (error) {
        console.log("⚠️ X402Integration verification failed:", error.message, "\n");
    }

    // Verify Luminar
    console.log("Verifying Luminar...");
    try {
        await hre.run("verify:verify", {
            address: deployment.contracts.Luminar,
            constructorArguments: [
                deployment.tokens.WCRO,
                deployment.config.feeCollector,
                deployment.config.platformFeeBP,
            ],
        });
        console.log("✅ Luminar verified\n");
    } catch (error) {
        console.log("⚠️ Luminar verification failed:", error.message, "\n");
    }

    console.log("🎉 Verification complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
