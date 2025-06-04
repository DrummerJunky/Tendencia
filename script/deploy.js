// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Compila Voting.sol y obtiene el contrato
  const Voting = await ethers.getContractFactory("Voting");
  // Despliega en la red configurada (p.ej. Sepolia)
  const voting = await Voting.deploy();
  await voting.deployed();
  console.log("Voting contract deployed to:", voting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
