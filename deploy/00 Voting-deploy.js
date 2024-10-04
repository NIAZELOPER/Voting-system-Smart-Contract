const { network } = require("hardhat");
const { DevelopementChains } = require("../helper-hardhat-config.js");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;
  if (DevelopementChains.includes(network.name)) {
    await deploy("Voting", {
      contract: "Voting",
      from: deployer,
      args: [],
      log: true,
    });
  }
};

module.exports.tags = ["all", "Voting"];
