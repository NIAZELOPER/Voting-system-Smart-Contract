const { ethers } = require("hardhat");

/* const networkConfig = {
    11155111: {
        name: "Sepolia",
        EntranceFee: ethers.parseEther("0.01"),
    },

    31337: {
        name: "hardhat",
        EntranceFee: ethers.parseEther("0.01"),
    },
}
*/

const DevelopementChains = ["hardhat", "localhost"];

module.exports = { DevelopementChains };
