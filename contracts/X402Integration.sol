// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title X402Integration
 * @notice Handles x402 payment rail integration for agentic payments
 * @dev Manages payment instructions, sessions, and agent-triggered settlements
 */
contract X402Integration is Ownable, ReentrancyGuard, Pausable {
    
    // ============ Structs ============
    
    struct PaymentInstruction {
        uint256 id;
        address sender;
        address recipient;
        uint256 amount;
        address token; // address(0) for native CRO
        bytes32 sessionId;
        PaymentStatus status;
        uint256 createdAt;
        uint256 executedAt;
        bytes metadata; // Additional payment metadata
    }
    
    struct X402Session {
        bytes32 id;
        address escrowContract;
        uint256 escrowId;
        address[] authorizedAgents;
        bool active;
        uint256 createdAt;
    }
    
    enum PaymentStatus {
        Pending,
        Approved,
        Executed,
        Cancelled,
        Failed
    }
    
    // ============ State Variables ============
    
    mapping(uint256 => PaymentInstruction) public paymentInstructions;
    mapping(bytes32 => X402Session) public sessions;
    mapping(address => bool) public authorizedAgents;
    mapping(address => bool) public trustedEscrows;
    
    uint256 public nextInstructionId;
    uint256 public totalInstructionsCreated;
    uint256 public totalInstructionsExecuted;
    
    // ============ Events ============
    
    event PaymentInstructionCreated(
        uint256 indexed instructionId,
        bytes32 indexed sessionId,
        address sender,
        address recipient,
        uint256 amount
    );
    
    event PaymentInstructionExecuted(
        uint256 indexed instructionId,
        bytes32 indexed sessionId,
        address executor
    );
    
    event SessionCreated(
        bytes32 indexed sessionId,
        address escrowContract,
        uint256 escrowId
    );
    
    event AgentAuthorized(address indexed agent);
    event AgentRevoked(address indexed agent);
    event EscrowTrusted(address indexed escrow);
    event EscrowRemoved(address indexed escrow);
    
    // ============ Modifiers ============
    
    modifier onlyAgent() {
        require(authorizedAgents[msg.sender], "X402: Not authorized agent");
        _;
    }
    
    modifier onlyTrustedEscrow() {
        require(trustedEscrows[msg.sender], "X402: Not trusted escrow");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        nextInstructionId = 1;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create an x402 session for an escrow
     * @param _sessionId Unique session identifier
     * @param _escrowId Associated escrow ID
     * @param _agents Authorized AI agents for this session
     */
    function createSession(
        bytes32 _sessionId,
        uint256 _escrowId,
        address[] calldata _agents
    ) external onlyTrustedEscrow whenNotPaused {
        require(!sessions[_sessionId].active, "X402: Session already exists");
        
        sessions[_sessionId] = X402Session({
            id: _sessionId,
            escrowContract: msg.sender,
            escrowId: _escrowId,
            authorizedAgents: _agents,
            active: true,
            createdAt: block.timestamp
        });
        
        emit SessionCreated(_sessionId, msg.sender, _escrowId);
    }
    
    /**
     * @notice Create a payment instruction (can be called by escrow or agent)
     * @param _sessionId Session ID
     * @param _sender Payment sender
     * @param _recipient Payment recipient
     * @param _amount Payment amount
     * @param _token Token address (address(0) for CRO)
     * @param _metadata Additional payment metadata
     */
    function createPaymentInstruction(
        bytes32 _sessionId,
        address _sender,
        address _recipient,
        uint256 _amount,
        address _token,
        bytes calldata _metadata
    ) external whenNotPaused returns (uint256) {
        X402Session storage session = sessions[_sessionId];
        require(session.active, "X402: Session not active");
        require(
            msg.sender == session.escrowContract || _isAuthorizedForSession(_sessionId, msg.sender),
            "X402: Not authorized"
        );
        
        uint256 instructionId = nextInstructionId++;
        
        paymentInstructions[instructionId] = PaymentInstruction({
            id: instructionId,
            sender: _sender,
            recipient: _recipient,
            amount: _amount,
            token: _token,
            sessionId: _sessionId,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            executedAt: 0,
            metadata: _metadata
        });
        
        totalInstructionsCreated++;
        
        emit PaymentInstructionCreated(
            instructionId,
            _sessionId,
            _sender,
            _recipient,
            _amount
        );
        
        return instructionId;
    }
    
    /**
     * @notice Approve a payment instruction (called by AI agents)
     * @param _instructionId Instruction ID to approve
     */
    function approvePaymentInstruction(uint256 _instructionId) 
        external 
        onlyAgent 
        whenNotPaused 
    {
        PaymentInstruction storage instruction = paymentInstructions[_instructionId];
        require(instruction.status == PaymentStatus.Pending, "X402: Invalid status");
        require(
            _isAuthorizedForSession(instruction.sessionId, msg.sender),
            "X402: Not authorized for session"
        );
        
        instruction.status = PaymentStatus.Approved;
    }
    
    /**
     * @notice Execute a payment instruction
     * @param _instructionId Instruction ID to execute
     */
    function executePaymentInstruction(uint256 _instructionId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        PaymentInstruction storage instruction = paymentInstructions[_instructionId];
        X402Session storage session = sessions[instruction.sessionId];
        
        require(instruction.status == PaymentStatus.Approved, "X402: Not approved");
        require(
            msg.sender == session.escrowContract || 
            _isAuthorizedForSession(instruction.sessionId, msg.sender),
            "X402: Not authorized to execute"
        );
        
        instruction.status = PaymentStatus.Executed;
        instruction.executedAt = block.timestamp;
        totalInstructionsExecuted++;
        
        emit PaymentInstructionExecuted(_instructionId, instruction.sessionId, msg.sender);
    }
    
    /**
     * @notice Close an x402 session
     * @param _sessionId Session ID to close
     */
    function closeSession(bytes32 _sessionId) external onlyTrustedEscrow {
        X402Session storage session = sessions[_sessionId];
        require(session.escrowContract == msg.sender, "X402: Not session owner");
        session.active = false;
    }
    
    // ============ Admin Functions ============
    
    function authorizeAgent(address _agent) external onlyOwner {
        authorizedAgents[_agent] = true;
        emit AgentAuthorized(_agent);
    }
    
    function revokeAgent(address _agent) external onlyOwner {
        authorizedAgents[_agent] = false;
        emit AgentRevoked(_agent);
    }
    
    function trustEscrow(address _escrow) external onlyOwner {
        trustedEscrows[_escrow] = true;
        emit EscrowTrusted(_escrow);
    }
    
    function removeEscrow(address _escrow) external onlyOwner {
        trustedEscrows[_escrow] = false;
        emit EscrowRemoved(_escrow);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function getPaymentInstruction(uint256 _instructionId) 
        external 
        view 
        returns (PaymentInstruction memory) 
    {
        return paymentInstructions[_instructionId];
    }
    
    function getSession(bytes32 _sessionId) 
        external 
        view 
        returns (X402Session memory) 
    {
        return sessions[_sessionId];
    }
    
    function isAgentAuthorized(address _agent) external view returns (bool) {
        return authorizedAgents[_agent];
    }
    
    function isEscrowTrusted(address _escrow) external view returns (bool) {
        return trustedEscrows[_escrow];
    }
    
    // ============ Internal Functions ============
    
    function _isAuthorizedForSession(bytes32 _sessionId, address _agent) 
        internal 
        view 
        returns (bool) 
    {
        X402Session storage session = sessions[_sessionId];
        for (uint i = 0; i < session.authorizedAgents.length; i++) {
            if (session.authorizedAgents[i] == _agent) {
                return true;
            }
        }
        return false;
    }
}
