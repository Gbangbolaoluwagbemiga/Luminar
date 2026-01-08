const hre = require("hardhat");

async function main() {
  const address = "0x25db74CF4E7BA120526fd87e159CF656d94bAE43";
  console.log(`Checking address: ${address} on Celo Mainnet...`);

  // Define minimal ABI
  const abi = [
    "function userRegistrations(address app, address user) view returns (uint32, uint32)"
  ];

  try {
    const contract = await hre.ethers.getContractAt(abi, address);
    // Try to read random user
    const [isReg, lastClaim] = await contract.userRegistrations(address, "0x0000000000000000000000000000000000000000");
    console.log(`✅ Success! userRegistrations call worked. isReg: ${isReg}, lastClaim: ${lastClaim}`);
  } catch (error) {
    console.log("❌ Error calling userRegistrations:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
