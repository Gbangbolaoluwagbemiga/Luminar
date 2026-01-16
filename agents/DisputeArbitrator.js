const { ethers } = require("ethers");
const X402Facilitator = require("../lib/x402/facilitator");
require("dotenv").config();

/**
 * AI Dispute Arbitrator Agent
 * Analyzes dispute evidence and recommends/executes resolutions via x402
 */
class DisputeArbitrator {
    constructor(provider, luminarAddress, x402Address, agentRegistryAddress, agentSigner) {
        this.provider = provider;
        this.agentSigner = agentSigner;
        this.agentAddress = agentSigner.address;

        this.x402 = new X402Facilitator(provider, x402Address);

        // Luminar contract ABI (minimal for disputes)
        this.luminarAbi = [
            "event DisputeRaised(uint256 indexed escrowId, address indexed raiser, string reason)",
            "event DisputeResolved(uint256 indexed escrowId, address indexed resolver, bool favorClient)",
            "function getEscrow(uint256 escrowId) external view returns (tuple(address client, address freelancer, uint256 amount, address paymentToken, bool isCompleted, bool isCancelled, uint256 createdAt))"
        ];

        this.luminarContract = new ethers.Contract(luminarAddress, this.luminarAbi, provider);

        // Agent Registry
        this.registryAbi = [
            "function recordAction(address _agent, uint8 _actionType, uint256 _escrowId, bool _success, bytes32 _reasoningHash) external returns (uint256)"
        ];

        this.registryContract = new ethers.Contract(agentRegistryAddress, this.registryAbi, provider);

        console.log(`⚖️  Dispute Arbitrator initialized with agent: ${this.agentAddress}`);
    }

    /**
     * Analyze a dispute using AI
     * In production, this would use OpenAI/Claude to analyze evidence
     */
    async analyzeDispute(escrowId, raiser, reason, evidence = {}) {
        console.log(`\n🔍 Analyzing dispute for escrow ${escrowId}...`);
        console.log(`Raised by: ${raiser}`);
        console.log(`Reason: ${reason}`);

        // Get escrow details
        const escrow = await this.luminarContract.getEscrow(escrowId);

        // Simulated AI analysis
        // In production, this would:
        // 1. Analyze submitted evidence (documents, messages, code)
        // 2. Review milestone history
        // 3. Check reputation of both parties
        // 4. Use AI to recommend fair resolution

        const analysis = {
            resolution: "favorFreelancer", // Options: favorFreelancer, favorClient, split, requireMoreInfo
            confidence: 0.75,
            reasoning: "Based on the dispute reason and evidence patterns, the AI recommends favoring the freelancer. In production, this would include detailed analysis of all submitted evidence, communications, and deliverables.",
            recommendedAction: {
                refundClient: false,
                payFreelancer: true,
                splitPercentage: null // If split, e.g., { client: 30, freelancer: 70 }
            }
        };

        const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes(analysis.reasoning));

        console.log(`✅ Analysis complete:`);
        console.log(`   Resolution: ${analysis.resolution}`);
        console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
        console.log(`   Action: ${analysis.recommendedAction.payFreelancer ? 'Pay freelancer' : 'Refund client'}`);

        return { ...analysis, reasoningHash, escrow };
    }

    /**
     * Process a dispute and execute resolution
     */
    async processDispute(escrowId, raiser, reason, sessionId) {
        try {
            // Step 1: Analyze the dispute
            const analysis = await this.analyzeDispute(escrowId, raiser, reason);

            if (analysis.confidence >= 0.6) {
                console.log(`\n💼 Executing resolution via x402 payment...`);

                // Step 2: Create payment instruction based on resolution
                const { escrow } = analysis;
                let recipient, sender;

                if (analysis.recommendedAction.payFreelancer) {
                    recipient = escrow.freelancer;
                    sender = escrow.client;
                } else {
                    recipient = escrow.client;
                    sender = escrow.freelancer; // Refund scenario
                }

                const metadata = {
                    type: "dispute_resolution",
                    escrowId: escrowId.toString(),
                    resolution: analysis.resolution,
                    confidence: analysis.confidence,
                    timestamp: Date.now()
                };

                // Create payment instruction
                const { instructionId } = await this.x402.createPaymentInstruction(
                    sessionId,
                    sender,
                    recipient,
                    escrow.amount,
                    escrow.paymentToken,
                    metadata,
                    this.agentSigner
                );

                // Step 3: Auto-approve the payment instruction
                await this.x402.approvePaymentInstruction(instructionId, this.agentSigner);

                // Step 4: Record action in registry
                const registryWithSigner = this.registryContract.connect(this.agentSigner);
                await registryWithSigner.recordAction(
                    this.agentAddress,
                    2, // DisputeResolution
                    escrowId,
                    true,
                    analysis.reasoningHash
                );

                console.log(`✅ Dispute resolved and payment instruction created: ${instructionId}`);
                return {
                    success: true,
                    instructionId,
                    resolution: analysis.resolution
                };
            } else {
                console.log(`⚠️  Confidence too low, escalating to human arbiters`);

                // Record the decision to escalate
                const registryWithSigner = this.registryContract.connect(this.agentSigner);
                await registryWithSigner.recordAction(
                    this.agentAddress,
                    2,
                    escrowId,
                    true,
                    analysis.reasoningHash
                );

                return {
                    success: true,
                    escalated: true,
                    reason: "Confidence threshold not met"
                };
            }
        } catch (error) {
            console.error(`❌ Error processing dispute:`, error.message);

            // Record failure
            try {
                const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes(`Error: ${error.message}`));
                const registryWithSigner = this.registryContract.connect(this.agentSigner);
                await registryWithSigner.recordAction(
                    this.agentAddress,
                    2,
                    escrowId,
                    false,
                    reasoningHash
                );
            } catch (recordError) {
                console.error("Failed to record error:", recordError.message);
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for dispute events
     */
    async startMonitoring() {
        console.log(`\n👀 Monitoring for disputes...`);

        this.luminarContract.on("DisputeRaised", async (escrowId, raiser, reason, event) => {
            console.log(`\n⚠️  Dispute raised!`);
            console.log(`   Escrow ID: ${escrowId}`);
            console.log(`   Raised by: ${raiser}`);
            console.log(`   Reason: ${reason}`);
            console.log(`   ℹ️  Use processDispute() to analyze and resolve`);
        });
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.luminarContract.removeAllListeners("DisputeRaised");
        console.log("🛑 Stopped monitoring disputes");
    }
}

module.exports = DisputeArbitrator;
