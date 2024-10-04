const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  //const signer1 = await ethers.getSigner(deployer);
  const signer2 = (await ethers.getSigners())[1];
  console.log(signer2.address);
  const Contract = await deployments.get("Voting");
  const voting = await ethers.getContractAt(Contract.abi, Contract.address);
  const transactionResponse = await voting.RegisterCandidate(
    "bro",
    signer2.address
  );
  await transactionResponse.wait(1);
  console.log(`Success!`);
  const RegistrationStatus = await voting.candidates(1);
  console.log(`RegistrationStatus ${RegistrationStatus.registered}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
