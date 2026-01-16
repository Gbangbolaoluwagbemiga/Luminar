const { ethers } = require("ethers");
const X402Facilitator = require("../lib/x402/facilitator");
require("dotenv").config();

/**
 * AI Milestone Monitor Agent
 * Monitors milestone submissions and triggers x402 payments when approved
 */
class MilestoneMonitor {
    constructor(provider, luminarAddress, x402Address, agentRegistryAddress, agentSigner) {
        this.provider = provider;
        this.agentSigner = agentSigner;
        this.agentAddress = agentSigner.address;

        // Initialize contracts
        this.x402 = new X402Facilitator(provider, x402Address);

        // Luminar contract ABI (minimal for milestone monitoring)
        this.luminarAbi = [
            "event MilestoneSubmitted(uint256 indexed escrowId, uint256 indexed milestoneIndex, string deliverableUrl)",
            "event MilestoneApproved(uint256 indexed escrowId, uint256 indexed milestoneIndex)",
            "event MilestoneRejected(uint256 indexed escrowId, uint256 indexed milestoneIndex, string reason)",
            "function getMilestone(uint256 escrowId, uint256 milestoneIndex) external view returns (tuple(string description, uint256 amount, bool completed, bool paid, string deliverableUrl, uint256 submittedAt))"
        ];

        this.luminarContract = new ethers.Contract(luminarAddress, this.luminarAbi, provider);

        // Agent Registry ABI (minimal)
        this.registryAbi = [
            "function recordAction(address _agent, uint8 _actionType, uint256 _escrowId, bool _success, bytes32 _reasoningHash) external returns (uint256)"
        ];

        this.registryContract = new ethers.Contract(agentRegistryAddress, this.registryAbi, provider);

        console.log(`🤖 Milestone Monitor initialized with agent: ${this.agentAddress}`);
    }

    /**
     * Analyze a milestone submission using AI
     * In production, this would call OpenAI/Claude API
     * For hackathon demo, we'll use rule-based logic
     */
    async analyzeMilestone(escrowId, milestoneIndex, deliverableUrl) {
        console.log(`\n🔍 Analyzing milestone ${milestoneIndex} for escrow ${escrowId}...`);
        console.log(`Deliverable URL: ${deliverableUrl}`);

        // Simulated AI analysis
        // In production, this would:
        // 1. Fetch the deliverable content
        // 2. Send to OpenAI/Claude for analysis
        // 3. Compare against milestone description
        // 4. Check quality metrics

        const analysis = {
            approved: true, // For demo, auto-approve valid submissions
            confidence: 0.85,
            reasoning: "Deliverable submission detected. Auto-approving for demo purposes. In production, this would use AI to analyze deliverable quality, completeness, and alignment with requirements.",
            checks: {
                hasDeliverable: deliverableUrl && deliverableUrl.length > 0,
                validFormat: true,
                meetsRequirements: true
            }
        };

        // Generate reasoning hash
        const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes(analysis.reasoning));

        console.log(`✅ Analysis complete:`);
        console.log(`   Approved: ${analysis.approved}`);
        console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
        console.log(`   Reasoning: ${analysis.reasoning}`);

        return { ...analysis, reasoningHash };
    }

    /**
     * Process a milestone submission
     */
    async processMilestone(escrowId, milestoneIndex, deliverableUrl, sessionId, instructionId) {
        try {
            // Step 1: Analyze the milestone
            const analysis = await this.analyzeMilestone(escrowId, milestoneIndex, deliverableUrl);

            if (analysis.approved && analysis.confidence >= 0.7) {
                console.log(`\n💰 Approving payment instruction ${instructionId}...`);

                // Step 2: Approve x402 payment instruction
                await this.x402.approvePaymentInstruction(instructionId, this.agentSigner);

                // Step 3: Record successful action in registry
                const registryWithSigner = this.registryContract.connect(this.agentSigner);
                await registryWithSigner.recordAction(
                    this.agentAddress,
                    0, // MilestoneApproval
                    escrowId,
                    true,
                    analysis.reasoningHash
                );

                console.log(`✅ Milestone ${milestoneIndex} approved and payment instruction authorized`);
                return { success: true, approved: true };
            } else {
                console.log(`❌ Milestone ${milestoneIndex} rejected (confidence too low or failed checks)`);

                // Record rejection in registry
                const registryWithSigner = this.registryContract.connect(this.agentSigner);
                await registryWithSigner.recordAction(
                    this.agentAddress,
                    1, // MilestoneRejection
                    escrowId,
                    true,
                    analysis.reasoningHash
                );

                return { success: true, approved: false, reason: analysis.reasoning };
            }
        } catch (error) {
            console.error(`❌ Error processing milestone:`, error.message);

            // Record failed action
            try {
                const reasoningHash = ethers.keccak256(ethers.toUtf8Bytes(`Error: ${error.message}`));
                const registryWithSigner = this.registryContract.connect(this.agentSigner);
                await registryWithSigner.recordAction(
                    this.agentAddress,
                    0,
                    escrowId,
                    false,
                    reasoningHash
                );
            } catch (recordError) {
                console.error("Failed to record error in registry:", recordError.message);
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for milestone submissions and process them
     */
    async startMonitoring() {
        console.log(`\n👀 Monitoring for milestone submissions...`);

        this.luminarContract.on("MilestoneSubmitted", async (escrowId, milestoneIndex, deliverableUrl, event) => {
            console.log(`\n🔔 New milestone submission detected!`);
            console.log(`   Escrow ID: ${escrowId}`);
            console.log(`   Milestone: ${milestoneIndex}`);

            // In production, you would:
            // 1. Check if there's an x402 session for this escrow
            // 2. Get the payment instruction ID
            // 3. Process the milestone

            // For hackathon demo, we'll log and wait for manual triggering
            console.log(`   ℹ️  Use processMilestone() to analyze and approve`);
        });
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.luminarContract.removeAllListeners("MilestoneSubmitted");
        console.log("🛑 Stopped monitoring");
    }
}

module.exports = MilestoneMonitor;
