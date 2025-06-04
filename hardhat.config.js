require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  paths: {
    sources: "./contracts",       
    artifacts: "./artifacts",
  },
  networks: {
    
    sepolia: {
      url: process.env.SEPOLIA_URL,      
      accounts: [process.env.PRIVATE_KEY],
    },

  },
};
