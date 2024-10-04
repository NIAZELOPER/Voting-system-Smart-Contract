require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
//require("hardhat-contract-sizer");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COIN_API_KEY = process.env.COIN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      //accounts: Thanks hardhat :)
      chainId: 31337,
      blockConfirmations: 1,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //accounts: Thanks hardhat :)
      chainId: 31337,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },

  gasReporter: {
    enabled: true,
    outputFile: "gas-reporter.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_API_KEY,
  },
  /*
mocha: {
    timeout: 30000, // 3 seconds
},
*/
};
