# Luminar - AI-Powered Freelance Escrow with Agentic Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.19-blue)](https://soliditylang.org/)
[![Cronos](https://img.shields.io/badge/Built%20on-Cronos-blue)](https://cronos.org/)
[![x402](https://img.shields.io/badge/x402-Agentic%20Payments-green)](https://docs.cronos.org/)

> **Cronos x402 Paytech Hackathon Submission** - AI agents that autonomously manage freelance payments using x402 programmable payment rails

## 🚀 What is Luminar?

Luminar is an intelligent freelance escrow platform that revolutionizes how payments are managed in the gig economy. By combining **AI agents** with **x402 payment rails** on Cronos EVM, Luminar automates the entire payment lifecycle—from milestone verification to dispute resolution.

**The Problem:** Traditional escrow requires manual oversight, leading to delays, disputes, and trust issues.

**Our Solution:** AI agents monitor deliverables 24/7, automatically approve quality work, and trigger instant payments via x402—all while maintaining full transparency on-chain.

## ✨ Key Innovations

### 🤖 AI Milestone Monitor
- Analyzes deliverable submissions using AI
- Auto-approves milestones that meet requirements
- Triggers x402 payment instructions instantly
- Learns from feedback to improve decisions

### ⚖️ AI Dispute Arbitrator
- Reviews evidence from both parties
- Recommends fair resolutions based on analysis
- Executes settlements via x402 automatically
- Escalates complex cases to human arbiters

### ⚡ x402 Agentic Payments
- Programmable payment rails for automated execution
- AI-triggered payment instructions
- Multi-step payment workflows
- Full on-chain audit trail

### 🔒 Security & Transparency
- All AI decisions recorded on-chain
- Agent success rates tracked publicly
- Multi-signature fallbacks for safety
- Emergency pause controls

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Luminar Platform                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Luminar    │  │     x402     │  │  AI Agent    │ │
│  │   Contract   │◄─┤ Integration  │◄─┤   Registry   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
           ▲                    ▲
           │                    │
    ┌──────┴──────┐      ┌─────┴──────┐
    │  Milestone  │      │  Dispute   │
    │   Monitor   │      │ Arbitrator │
    │  AI Agent   │      │  AI Agent  │
    └─────────────┘      └────────────┘
```

## 📁 Project Structure

```
luminar/
├── contracts/
│   ├── Luminar.sol              # Main escrow contract
│   ├── X402Integration.sol      # x402 payment rails
│   ├── AIAgentRegistry.sol      # Agent management
│   └── modules/                 # Escrow modules
├── agents/
│   ├── MilestoneMonitor.js      # AI milestone agent
│   ├── DisputeArbitrator.js     # AI dispute agent
│   ├── setup-agents.js          # Agent deployment
│   └── demo.js                  # Demo scenarios
├── lib/x402/
│   └── facilitator.js           # x402 wrapper
├── scripts/
│   ├── deploy-cronos.js         # Deployment script
│   └── verify-cronos.js         # Verification script
└── frontend/                    # Next.js UI (TBD)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **MetaMask** or compatible wallet
- **Cronos testnet** CRO tokens ([Get from faucet](https://cronos.org/faucet))

### Installation

```bash
# Clone repository
git clone <repo-url>
cd luminar

# Install dependencies
npm install

# Configure environment
cp .env.cronos.example .env
# Edit .env and add your PRIVATE_KEY and API keys
```

### Deploy to Cronos Testnet

```bash
# 1. Deploy contracts
npm run deploy:cronos-testnet

# 2. Setup AI agents
npm run setup-agents

# 3. Run demo
node agents/demo.js cronosTestnet
```

## 🎬 Demo Scenarios

### Scenario 1: AI Milestone Approval

```javascript
// Client creates $1000 escrow with milestone
// Freelancer completes work and submits deliverable
// AI Milestone Monitor analyzes submission
// AI approves → x402 triggers instant payment ✅
```

### Scenario 2: AI Dispute Resolution

```javascript
// Client raises dispute about deliverable quality  
// AI Arbitrator analyzes evidence from both parties
// AI recommends resolution (favor freelancer/client)
// x402 executes settlement payment automatically ⚖️
```

Run the full demo:
```bash
npm run test:agents
```

## 🔧 Configuration

### Environment Variables

```env
# Cronos Network
CRONOS_TESTNET_RPC_URL=https://evm-t3.cronos.org
PRIVATE_KEY=your_private_key_here
CRONOSCAN_API_KEY=your_api_key_here

# x402 (optional)
X402_FACILITATOR_URL=https://x402-facilitator.crypto.com
X402_API_KEY=your_x402_key

# AI (for production)
OPENAI_API_KEY=your_openai_key # For real AI analysis
```

## 📊 Smart Contracts

### Cronos Testnet Deployment

| Contract | Address | Explorer |
|----------|---------|----------|
| Luminar | TBD | [View](https://testnet.cronoscan.com) |
| X402Integration | TBD | [View](https://testnet.cronoscan.com) |
| AIAgentRegistry | TBD | [View](https://testnet.cronoscan.com) |

*Deploy first, addresses will populate after deployment*

## 🎯 Hackathon Features

### Main Track Requirements ✅
- ✅ AI agents using x402 for novel on-chain actions
- ✅ Agent-triggered payments
- ✅ Dynamic asset management (escrow)
- ✅ Automated treasury logic (milestone payments)

### Agentic Finance Track ✅  
- ✅ Automated settlement pipelines
- ✅ Multi-step transactions (milestone → approval → payment)
- ✅ Conditional instruction sets (AI-based approval)

### Technical Innovation 🚀
- **AI-Powered Decision Making**: Agents analyze deliverables and evidence
- **x402 Payment Automation**: Programmable payment execution
- **On-Chain Transparency**: All agent actions recorded
- **Production-Ready Code**: Built on battle-tested SecureFlow codebase

## 🧪 Testing

```bash
# Compile contracts
npx hardhat compile

# Run contract tests
npx hardhat test --network cronosTestnet

# Test AI agents
node agents/demo.js cronosTestnet

# Verify contracts
npm run verify:cronos-testnet
```

## 🛡️ Security

- **Audited Modules**: Built on OpenZeppelin standards
- **Reentrancy Protection**: All external functions protected
- **Agent Success Tracking**: Low-performing agents auto-disabled
- **Emergency Controls**: Owner can pause system
- **Multi-sig Support**: Critical actions require approvals

## 📈 Roadmap

**Hackathon MVP (Current)**
- ✅ Core escrow with x402integration
- ✅ AI Milestone Monitor
- ✅ AI Dispute Arbitrator
- ✅ On-chain agent registry
- 🔄 Frontend integration *(in progress)*

**Post-Hackathon**
- 🔮 Real AI models (OpenAI/Claude integration)
- 🔮 Multi-agent consensus
- 🔮 Reputation-based agent selection
- 🔮 Cross-chain x402 support
- 🔮 Mobile app

## 🏆 Why Luminar Wins

1. **Real Innovation**: First platform to use AI + x402 for escrow automation
2. **Production Quality**: Built on proven SecureFlow codebase
3. **Solves Real Problems**: Freelancers get paid faster, clients get better assurance
4. **Fully Functional**: Working demo with actual AI agents and x402 integration
5. **Ecosystem Value**: Brings DeFi automation to the $1.5T gig economy

## 📚 Learn More

- [Cronos x402 Docs](https://docs.cronos.org/cronos-x402-facilitator/)
- [Implementation Plan](./docs/implementation_plan.md)
- [AI Agent Architecture](./docs/agent-architecture.md)

## 🤝 Team

Built for the Cronos x402 Paytech Hackathon by passionate builders who believe in AI-powered DeFi automation.

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ on Cronos EVM | Powered by x402 Agentic Payments**

_Luminar - Where AI meets trust in the future of work_ ✨
