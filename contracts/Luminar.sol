// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./modules/EscrowCore.sol";
import "./modules/EscrowManagement.sol";
import "./modules/Marketplace.sol";
import "./modules/WorkLifecycle.sol";
import "./modules/AdminFunctions.sol";
import "./modules/RefundSystem.sol";
import "./modules/ViewFunctions.sol";
import "./modules/RatingSystem.sol";

/**
 * @title Luminar - AI-Powered Freelance Escrow with Agentic Automation
 * @dev Modular hybrid escrow + marketplace with x402 payment rails and AI agents
 * @notice Built for Cronos x402 Paytech Hackathon
 */
contract Luminar is 
    EscrowCore,
    EscrowManagement,
    Marketplace,
    WorkLifecycle,
    AdminFunctions,
    RefundSystem,
    ViewFunctions,
    RatingSystem
{
    // x402 Integration
    address public x402Integration;
    address public aiAgentRegistry;
    
    event X402Integrated(address indexed x402Contract);
    event AIRegistryIntegrated(address indexed registryContract);
    
    constructor(
        address _monadToken, 
        address _feeCollector, 
        uint256 _platformFeeBP
    ) EscrowCore(_monadToken, _feeCollector, _platformFeeBP) {
        // Constructor is handled by EscrowCore
    }
    
    /**
     * @notice Integrate x402 payment contract
     * @param _x402Integration Address of X402Integration contract
     */
    function setX402Integration(address _x402Integration) external onlyOwner {
        require(_x402Integration != address(0), "Invalid x402 address");
        x402Integration = _x402Integration;
        emit X402Integrated(_x402Integration);
    }
    
    /**
     * @notice Integrate AI agent registry
     * @param _registry Address of AIAgentRegistry contract
     */
    function setAIRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "Invalid registry address");
        aiAgentRegistry = _registry;
        emit AIRegistryIntegrated(_registry);
    }
}

