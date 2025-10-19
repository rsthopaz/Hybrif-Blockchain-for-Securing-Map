require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ALCHEMY_PRIVATE_KEY_URL = process.env.ALCHEMY_PRIVATE_KEY_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: ALCHEMY_PRIVATE_KEY_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

module.exports = config;
