const { ethers } = require("ethers");
require("dotenv").config();

/**
 * x402 Facilitator Client Wrapper
 * Manages x402 payment instructions and sessions
 */
class X402Facilitator {
    constructor(provider, x402ContractAddress) {
        this.provider = provider;
        this.x402Address = x402ContractAddress;

        // x402Integration contract ABI (minimal for our needs)
        this.abi = [
            "function createSession(bytes32 _sessionId, uint256 _escrowId, address[] calldata _agents) external",
            "function createPaymentInstruction(bytes32 _sessionId, address _sender, address _recipient, uint256 _amount, address _token, bytes calldata _metadata) external returns (uint256)",
            "function approvePaymentInstruction(uint256 _instructionId) external",
            "function executePaymentInstruction(uint256 _instructionId) external",
            "function getPaymentInstruction(uint256 _instructionId) external view returns (tuple(uint256 id, address sender, address recipient, uint256 amount, address token, bytes32 sessionId, uint8 status, uint256 createdAt, uint256 executedAt, bytes metadata))",
            "event PaymentInstructionCreated(uint256 indexed instructionId, bytes32 indexed sessionId, address sender, address recipient, uint256 amount)",
            "event PaymentInstructionExecuted(uint256 indexed instructionId, bytes32 indexed sessionId, address executor)"
        ];

        this.contract = new ethers.Contract(x402ContractAddress, this.abi, provider);
    }

    /**
     * Create an x402 session for an escrow
     */
    async createSession(sessionId, escrowId, agentAddresses, signer) {
        const contract = this.contract.connect(signer);
        const tx = await contract.createSession(sessionId, escrowId, agentAddresses);
        const receipt = await tx.wait();

        console.log(`✅ x402 Session created: ${sessionId}`);
        return { sessionId, receipt };
    }

    /**
     * Create a payment instruction
     */
    async createPaymentInstruction(sessionId, sender, recipient, amount, token, metadata, signer) {
        const contract = this.contract.connect(signer);

        // Encode metadata as bytes
        const metadataBytes = ethers.toUtf8Bytes(JSON.stringify(metadata));

        const tx = await contract.createPaymentInstruction(
            sessionId,
            sender,
            recipient,
            amount,
            token,
            metadataBytes
        );

        const receipt = await tx.wait();

        // Parse the event to get instruction ID
        const event = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === "PaymentInstructionCreated";
            } catch {
                return false;
            }
        });

        if (!event) {
            throw new Error("PaymentInstructionCreated event not found");
        }

        const parsedEvent = contract.interface.parseLog(event);
        const instructionId = parsedEvent.args.instructionId;

        console.log(`✅ Payment instruction created: ${instructionId}`);
        return { instructionId, receipt };
    }

    /**
     * Approve a payment instruction (called by AI agent)
     */
    async approvePaymentInstruction(instructionId, agentSigner) {
        const contract = this.contract.connect(agentSigner);
        const tx = await contract.approvePaymentInstruction(instructionId);
        const receipt = await tx.wait();

        console.log(`✅ Payment instruction approved: ${instructionId}`);
        return receipt;
    }

    /**
     * Execute a payment instruction
     */
    async executePaymentInstruction(instructionId, signer) {
        const contract = this.contract.connect(signer);
        const tx = await contract.executePaymentInstruction(instructionId);
        const receipt = await tx.wait();

        console.log(`✅ Payment instruction executed: ${instructionId}`);
        return receipt;
    }

    /**
     * Get payment instruction details
     */
    async getPaymentInstruction(instructionId) {
        return await this.contract.getPaymentInstruction(instructionId);
    }

    /**
     * Generate a unique session ID
     */
    static generateSessionId(escrowId, nonce = Date.now()) {
        return ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "uint256"],
                [escrowId, nonce]
            )
        );
    }

    /**
     * Parse payment metadata
     */
    static parseMetadata(metadataBytes) {
        try {
            const metadataString = ethers.toUtf8String(metadataBytes);
            return JSON.parse(metadataString);
        } catch (error) {
            console.error("Error parsing metadata:", error);
            return {};
        }
    }
}

module.exports = X402Facilitator;
