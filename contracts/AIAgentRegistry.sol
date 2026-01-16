// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AIAgentRegistry
 * @notice Manages authorized AI agents and their permissions
 * @dev Tracks agent activity, permissions, and provides emergency controls
 */
contract AIAgentRegistry is Ownable, Pausable {
    
    // ============ Structs ============
    
    struct Agent {
        address agentAddress;
        string name;
        AgentType agentType;
        AgentPermissions permissions;
        bool active;
        uint256 registeredAt;
        uint256 totalActions;
        uint256 successfulActions;
    }
    
    enum AgentType {
        MilestoneMonitor,
        DisputeArbitrator,
        JobMatcher,
        RiskAssessor,
        Custom
    }
    
    struct AgentPermissions {
        bool canApproveMilestones;
        bool canResolveDisputes;
        bool canCreatePayments;
        bool canModifyEscrow;
    }
    
    struct AgentAction {
        uint256 id;
        address agent;
        ActionType actionType;
        uint256 escrowId;
        bool success;
        uint256 timestamp;
        bytes32 reasoningHash; // Hash of the AI's decision reasoning
    }
    
    enum ActionType {
        MilestoneApproval,
        MilestoneRejection,
        DisputeResolution,
        PaymentTrigger,
        RiskAssessment
    }
    
    // ============ State Variables ============
    
    mapping(address => Agent) public agents;
    mapping(uint256 => AgentAction) public actions;
    mapping(AgentType => uint256) public agentTypeCount;
    
    address[] public allAgents;
    uint256 public nextActionId;
    uint256 public totalAgents;
    
    // Reputation thresholds
    uint256 public minSuccessRateForActions = 75; // 75% success rate required
    
    // ============ Events ============
    
    event AgentRegistered(
        address indexed agent,
        string name,
        AgentType agentType
    );
    
    event AgentDeactivated(address indexed agent, string reason);
    event AgentReactivated(address indexed agent);
    
    event ActionRecorded(
        uint256 indexed actionId,
        address indexed agent,
        ActionType actionType,
        uint256 escrowId,
        bool success
    );
    
    event PermissionsUpdated(
        address indexed agent,
        AgentPermissions permissions
    );
    
    // ============ Modifiers ============
    
    modifier onlyActiveAgent() {
        require(agents[msg.sender].active, "Agent: Not active");
        require(_hasAcceptableSuccessRate(msg.sender), "Agent: Low success rate");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        nextActionId = 1;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Register a new AI agent
     * @param _agentAddress Address of the AI agent
     * @param _name Human-readable name
     * @param _agentType Type of agent
     * @param _permissions Initial permissions
     */
    function registerAgent(
        address _agentAddress,
        string calldata _name,
        AgentType _agentType,
        AgentPermissions calldata _permissions
    ) external onlyOwner {
        require(_agentAddress != address(0), "Agent: Invalid address");
        require(!agents[_agentAddress].active, "Agent: Already registered");
        
        agents[_agentAddress] = Agent({
            agentAddress: _agentAddress,
            name: _name,
            agentType: _agentType,
            permissions: _permissions,
            active: true,
            registeredAt: block.timestamp,
            totalActions: 0,
            successfulActions: 0
        });
        
        allAgents.push(_agentAddress);
        agentTypeCount[_agentType]++;
        totalAgents++;
        
        emit AgentRegistered(_agentAddress, _name, _agentType);
    }
    
    /**
     * @notice Record an action performed by an agent
     * @param _agent Agent address
     * @param _actionType Type of action
     * @param _escrowId Related escrow ID
     * @param _success Whether the action was successful
     * @param _reasoningHash Hash of the AI's decision reasoning
     */
    function recordAction(
        address _agent,
        ActionType _actionType,
        uint256 _escrowId,
        bool _success,
        bytes32 _reasoningHash
    ) external whenNotPaused returns (uint256) {
        require(agents[_agent].active, "Agent: Not active");
        
        uint256 actionId = nextActionId++;
        
        actions[actionId] = AgentAction({
            id: actionId,
            agent: _agent,
            actionType: _actionType,
            escrowId: _escrowId,
            success: _success,
            timestamp: block.timestamp,
            reasoningHash: _reasoningHash
        });
        
        Agent storage agent = agents[_agent];
        agent.totalActions++;
        if (_success) {
            agent.successfulActions++;
        }
        
        emit ActionRecorded(actionId, _agent, _actionType, _escrowId, _success);
        
        return actionId;
    }
    
    /**
     * @notice Update agent permissions
     * @param _agent Agent address
     * @param _permissions New permissions
     */
    function updatePermissions(
        address _agent,
        AgentPermissions calldata _permissions
    ) external onlyOwner {
        require(agents[_agent].registeredAt > 0, "Agent: Not registered");
        
        agents[_agent].permissions = _permissions;
        emit PermissionsUpdated(_agent, _permissions);
    }
    
    /**
     * @notice Deactivate an agent
     * @param _agent Agent address
     * @param _reason Reason for deactivation
     */
    function deactivateAgent(address _agent, string calldata _reason) 
        external 
        onlyOwner 
    {
        require(agents[_agent].active, "Agent: Already inactive");
        agents[_agent].active = false;
        emit AgentDeactivated(_agent, _reason);
    }
    
    /**
     * @notice Reactivate an agent
     * @param _agent Agent address
     */
    function reactivateAgent(address _agent) external onlyOwner {
        require(!agents[_agent].active, "Agent: Already active");
        require(agents[_agent].registeredAt > 0, "Agent: Not registered");
        agents[_agent].active = true;
        emit AgentReactivated(_agent);
    }
    
    /**
     * @notice Emergency deactivate all agents
     */
    function pauseAllAgents() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause all agents
     */
    function unpauseAllAgents() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function getAgent(address _agent) external view returns (Agent memory) {
        return agents[_agent];
    }
    
    function getAction(uint256 _actionId) external view returns (AgentAction memory) {
        return actions[_actionId];
    }
    
    function canPerformAction(address _agent, ActionType _actionType) 
        external 
        view 
        returns (bool) 
    {
        if (!agents[_agent].active || paused()) return false;
        if (!_hasAcceptableSuccessRate(_agent)) return false;
        
        AgentPermissions memory perms = agents[_agent].permissions;
        
        if (_actionType == ActionType.MilestoneApproval || 
            _actionType == ActionType.MilestoneRejection) {
            return perms.canApproveMilestones;
        }
        if (_actionType == ActionType.DisputeResolution) {
            return perms.canResolveDisputes;
        }
        if (_actionType == ActionType.PaymentTrigger) {
            return perms.canCreatePayments;
        }
        
        return false;
    }
    
    function getAgentSuccessRate(address _agent) public view returns (uint256) {
        Agent memory agent = agents[_agent];
        if (agent.totalActions == 0) return 100; // New agents start with 100%
        return (agent.successfulActions * 100) / agent.totalActions;
    }
    
    function getAllAgents() external view returns (address[] memory) {
        return allAgents;
    }
    
    function getAgentsByType(AgentType _type) 
        external 
        view 
        returns (address[] memory) 
    {
        address[] memory typeAgents = new address[](agentTypeCount[_type]);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allAgents.length; i++) {
            if (agents[allAgents[i]].agentType == _type && agents[allAgents[i]].active) {
                typeAgents[index] = allAgents[i];
                index++;
            }
        }
        
        return typeAgents;
    }
    
    // ============ Internal Functions ============
    
    function _hasAcceptableSuccessRate(address _agent) internal view returns (bool) {
        // Allow agents with < 10 actions to operate (learning period)
        if (agents[_agent].totalActions < 10) return true;
        
        return getAgentSuccessRate(_agent) >= minSuccessRateForActions;
    }
}
