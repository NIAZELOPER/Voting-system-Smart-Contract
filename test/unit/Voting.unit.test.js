const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { expect, assert } = require("chai");

describe("Voting unit test", function () {
  let deployer, signer, Account02, accounts, voting;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer; // deployer is owner
    Account02 = (await getNamedAccounts()).player; //storing second address in voter variable
    signer = await ethers.getSigner[0]; // retrieving deployer signer
    accounts = await ethers.getSigners();
    //voter = (await ethers.getSigners())[1];
    //console.log(voter.address);
    //console.log(player);
    await deployments.fixture(["all"]); // Runs all the deploy scripts having tag written in brackett here
    const Contract = await deployments.get("Voting");
    voting = await ethers.getContractAt("Voting", Contract.address, signer);
  });

  describe("Constructor", function () {
    it("sets the owner correctly", async () => {
      const transactionResponse = await voting.getOwner();
      assert.equal(transactionResponse, deployer);
    });

    it("Sets the voting state to calculating", async () => {
      const transactionResponse = await voting.getState();
      assert.equal(transactionResponse, 0);
    });
  });

  describe("RegisterCandidate", function () {
    it("revert when owner is registering as candidate", async function () {
      await expect(
        voting.RegisterCandidate("Deployer", deployer)
      ).to.be.revertedWithCustomError(voting, "Voting_OwnerCannotBeRegistered");
    });

    it("Only owner can register candidates", async () => {
      const Connectedcontract = await voting.connect(accounts[1]); // connect Account02 signer to contract
      await expect(
        Connectedcontract.RegisterCandidate("Account02", Account02) // candidate sends the transaction
      ).to.be.revertedWithCustomError(
        Connectedcontract,
        "Voting_OnlyOwnerCanRegister"
      );
    });

    it("should not register already registered candidate", async () => {
      await voting.RegisterCandidate("Account02", Account02); //Candidate is registered
      await expect(
        voting.RegisterCandidate("Account02", Account02)
      ).to.be.revertedWithCustomError(voting, "Voting_AlreadyRegistered");
    });

    it("Should add registered candidate in candidates array", async () => {
      await voting.RegisterCandidate("Account02", Account02);
      //console.log(await voting.getCandidate(Account02));
      const Index = await voting.candidate_To_array(Account02); // gets the index of Account02 candidate
      const transactionResponse = await voting.candidates(Index); // retrive address of registered candidate from candidates array using index
      const address = transactionResponse.public_Address;
      assert.equal(address, Account02);
      const votescasted = transactionResponse.votescasted;
      assert.equal(votescasted, 0);
      const RegistrationStatus = transactionResponse.registered;
      assert.equal(RegistrationStatus, true);
    });

    it("emits the event success", async () => {
      await expect(voting.RegisterCandidate("Account02", Account02)).to.emit(
        voting,
        "success"
      );
    });
  });

  describe("RegisterVoter", function () {
    it("Should not register ineligible voter", async () => {
      await expect(
        voting.RegisterVoter(deployer, 17)
      ).to.be.revertedWithCustomError(voting, "Voting_IneligibleForVote");
    });

    it("Should add voter in registered_Voters array", async () => {
      await voting.RegisterVoter(deployer, 19);
      await voting.RegisterVoter(Account02, 25);
      const Index = await voting.voterAdd_To_ArrayIndex(Account02);
      const transactionResponse = await voting.registered_Voters(Index);
      const address = transactionResponse.public_Address;
      assert.equal(address, Account02);
      const voted = transactionResponse.voted;
      assert.equal(voted, false);
    });
  });

  describe("StartVoting", function () {
    it("Only owner can start voting", async () => {
      const Connectedcontract = await voting.connect(accounts[1]);
      await expect(
        Connectedcontract.StartVoting()
      ).to.be.revertedWithCustomError(
        Connectedcontract,
        "Voting_OnlyOwnerCanStartVoting"
      );
    });

    it("Should change the state to OPEN", async () => {
      await voting.StartVoting();
      const transactionResponse = await voting.getState();
      assert.equal(transactionResponse, 1);
    });
  });

  describe("PutVote", function () {
    it("revert if VotingState in not OPEN", async () => {
      await voting.RegisterCandidate("Account02", Account02);
      await voting.RegisterVoter(deployer, 19);
      await expect(voting.PutVote(Account02)).to.be.revertedWithCustomError(
        voting,
        "Voting_VotingNotStartedYet"
      );
    });

    it("revert if voter is not registered", async () => {
      await voting.RegisterCandidate("Account02", Account02);
      await voting.StartVoting();
      await expect(voting.PutVote(Account02)).to.be.revertedWithCustomError(
        voting,
        "Voting_VoterNotRegistered"
      );
    });

    it("revert if candidate is not registered", async () => {
      await voting.RegisterVoter(deployer, 19);
      await voting.StartVoting();
      await expect(voting.PutVote(Account02)).to.be.revertedWith(
        "Candidate Not registered!"
      );
    });

    it("revert if voter has already voted", async () => {
      await voting.RegisterCandidate("Account02", Account02);
      await voting.RegisterVoter(deployer, 19);
      await voting.StartVoting();
      await voting.PutVote(Account02);
      await expect(voting.PutVote(Account02)).to.be.revertedWith(
        "Cannot cast vote again!"
      );
    });

    it("Assigns vote to selected candidate and update voter status", async () => {
      await voting.RegisterCandidate("Account02", Account02);
      const Index = await voting.candidate_To_array(Account02);
      const votesBefore = (await voting.candidates(Index)).votes;
      await voting.RegisterVoter(deployer, 19);
      await voting.StartVoting();
      await voting.PutVote(Account02);
      const votesAfter = (await voting.candidates(Index)).votes;
      const VoterStatus = (
        await voting.registered_Voters(
          await voting.voterAdd_To_ArrayIndex(deployer)
        )
      ).voted;
      assert(votesAfter > votesBefore);
      assert(VoterStatus);
    });
  });

  describe("EndVoting", function () {
    it("Only owner can close voting", async () => {
      const Connectedcontract = await voting.connect(accounts[1]);
      await expect(Connectedcontract.EndVoting()).to.be.revertedWithCustomError(
        Connectedcontract,
        "Voting_OnlyOwnerCanStopVoting"
      );
    });

    it("Should Change the votingState to CLOSED", async () => {
      await voting.RegisterCandidate("Account02", Account02);
      await voting.EndVoting();
      const transactionResponse = await voting.getState();
      assert.equal(transactionResponse, 2);
    });

    it("Should pick the winner correctly and assign it to s_winner", async () => {
      for (let i = 0; i < 4; i++) {
        if (i < 3) {
          await voting.RegisterCandidate("Patrick", accounts[i + 1].address);
        }
        await voting.RegisterVoter(accounts[i].address, 19);
      }
      await voting.StartVoting();
      let Connectedcontract;
      for (let i = 0; i < 4; i++) {
        Connectedcontract = await voting.connect(accounts[i]);
        let j = i + 1;
        if (i == 3) {
          await Connectedcontract.PutVote(accounts[j - 1].address); // Two voters (3rd and 4th) vote in favour of 3rd Candidate
        } else {
          await Connectedcontract.PutVote(accounts[j].address);
        }
      }
      await voting.EndVoting();
      const winner = await Connectedcontract.getWinner();
      console.log(winner);
      console.log(accounts[3].address);
      assert.equal(winner, accounts[3].address);
    });
  });
});
