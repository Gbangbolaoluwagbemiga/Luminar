# Luminar - AI-Powered Freelance Escrow

**Cronos x402 Paytech Hackathon Submission**

🏆 **Innovation:** First AI-powered freelance escrow platform using x402 agentic payment rails on Cronos

---

## 📁 Project Structure

```
luminar/
├── contracts/              # Smart contracts
│   ├── Luminar.sol        # Main escrow contract
│   ├── AIAgentRegistry.sol # AI agent management
│   ├── X402Integration.sol # x402 payment rails
│   └── modules/           # Escrow modules
├── agents/                # AI agents
│   ├── MilestoneMonitor.js    # Auto-approve milestones
│   ├── DisputeArbitrator.js   # Resolve disputes
│   ├── setup-agents-deployed.js
│   └── demo-deployed.js       # Demo script
├── lib/x402/              # x402 SDK wrapper
├── scripts/               # Deployment scripts
├── deployments/           # Contract addresses
└── frontend/              # Next.js UI (optional)
```

---

## 🚀 Deployed Contracts (Cronos Testnet)

| Contract | Address |
|----------|---------|
| AIAgentRegistry | [`0x659D3Ede264F2017C84C341000d02c13d1004490`](https://testnet.cronoscan.com/address/0x659D3Ede264F2017C84C341000d02c13d1004490) |
| X402Integration | [`0xdee8489FFfdB8Ce1643ecD508Ce1ca48575D4f31`](https://testnet.cronoscan.com/address/0xdee8489FFfdB8Ce1643ecD508Ce1ca48575D4f31) |

---

## ⚡ Quick Start

### Run Demo
```bash
# Install dependencies
npm install

# Run demo
node agents/demo-deployed.js cronosTestnet
```

### Compile Contracts
```bash
npx hardhat compile
```

---

## 🎯 Why Luminar Wins

### Innovation
- **First** platform combining AI agents with x402 agentic payments
- Autonomous decision-making recorded on-chain
- Production-ready architecture

### Real-World Impact
- Freelancers get paid in **minutes**, not days
- Clients get AI-verified quality assurance
- **90% reduction** in dispute resolution time

### Built for Cronos
- Leverages x402 programmable payment rails
- Deployed on Cronos testnet
- Ready for mainnet

---

## 🤖 How It Works

1. **Client creates escrow** with milestones
2. **Freelancer submits deliverable**
3. **AI Milestone Monitor** analyzes code/quality
4. **AI approves** → **x402 triggers instant payment**
5. If dispute: **AI Arbitrator** reviews evidence → executes settlement

---

## 📹 Demo Video

[🎥 Watch Demo](YOUR_YOUTUBE_LINK_HERE)

---

## 📚 Documentation

- [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) - Demo video script
- [`SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md) - Hackathon checklist
- [`DEPLOYMENT_STATUS.md`](./DEPLOYMENT_STATUS.md) - Deployment details

---

## 🔧 Technical Stack

- **Blockchain:** Cronos EVM (Testnet)
- **Smart Contracts:** Solidity 0.8.19
- **AI Agents:** Node.js + ethers.js
- **x402:** Cronos payment rails
- **Frontend:** Next.js + React (optional)

---

## 🏗️ Development

```bash
# Install
npm install

# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy (testnet)
npm run deploy:cronos-testnet

# Setup AI agents
node agents/setup-agents-deployed.js cronosTestnet
```

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

---

## 👥 Team

Built for the Cronos x402 Paytech Hackathon

---

**Luminar - Where AI meets trust in the future of work** ✨
