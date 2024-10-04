// 1 - pragma
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

//2- Imports

//3- Errors
error Voting_OwnerCannotBeRegistered();
error Voting_OnlyOwnerCanRegister();
error Voting_AlreadyRegistered();
error Voting_IneligibleForVote();
error Voting_OnlyOwnerCanStartVoting();
error Voting_OnlyOwnerCanStopVoting();
error Voting_VotingNotStartedYet();
error Voting_VoterNotRegistered();

//4- Interfaces, Libraries, Contracts

contract Voting {
    // Type Declerations
    enum VotingState {
        REGISTRATION,
        OPEN,
        CLOSED
    }
    // State Variables
    address private immutable i_owner;
    address private s_Winner;

    //Voting Variables
    VotingState private s_State;
    event success(string);

    // VOTE:
    struct Voter {
        address public_Address;
        uint256 age;
        bool registerd;
        bool voted;
    }
    Voter[] public registered_Voters;
    mapping(address => uint256) public voterAdd_To_ArrayIndex;

    // Candidate
    struct Candidate {
        string name;
        address public_Address;
        uint256 votes;
        bool registered;
    }
    Candidate[] public candidates;
    mapping(address => uint256) public candidate_To_array;

    constructor() {
        i_owner = msg.sender;
        s_State = VotingState.REGISTRATION;
    }

    function RegisterCandidate(string memory _name, address _identity) public {
        require(
            s_State == VotingState.REGISTRATION,
            "Registration due date has passed"
        );
        if (_identity == i_owner) {
            revert Voting_OwnerCannotBeRegistered();
        }
        if (msg.sender != i_owner) {
            revert Voting_OnlyOwnerCanRegister();
        }
        if (candidate_To_array[_identity] != 0) {
            revert Voting_AlreadyRegistered();
        }
        if (candidates.length == 0) {
            candidates.push();
        }
        candidate_To_array[_identity] = candidates.length;
        candidates.push(Candidate(_name, _identity, 0, true));
        emit success("Candidate Registered Successfully!");
    }

    function RegisterVoter(address _identity, uint256 _age) public {
        require(
            s_State == VotingState.REGISTRATION,
            "Registration due date has passed"
        );
        if (_age < 18) {
            revert Voting_IneligibleForVote();
        }
        if (registered_Voters.length == 0) {
            registered_Voters.push();
        }
        voterAdd_To_ArrayIndex[_identity] = registered_Voters.length;
        registered_Voters.push(Voter(_identity, _age, true, false));
        emit success("Voter Registered Successfully!");
    }

    function StartVoting() public {
        if (msg.sender != i_owner) {
            revert Voting_OnlyOwnerCanStartVoting();
        }
        s_State = VotingState.OPEN;
        emit success("Voting Started");
    }

    function PutVote(address _candidateAdd) public {
        //Checking if Voting is open:
        if (s_State != VotingState.OPEN) {
            revert Voting_VotingNotStartedYet();
        }
        // Checking if Voter is registered:
        bool isRegistered = false;
        for (uint256 i = 1; i < registered_Voters.length; i++) {
            Voter memory voter = registered_Voters[i];
            if (voter.public_Address == msg.sender) {
                isRegistered = true;
            }
        }
        if (!isRegistered) {
            revert Voting_VoterNotRegistered();
        }
        //Checking if Candidate is registered:
        require(
            candidate_To_array[_candidateAdd] != 0,
            "Candidate Not registered!"
        );
        //Checking if voter has voted or not:
        require(
            !registered_Voters[voterAdd_To_ArrayIndex[msg.sender]].voted,
            "Cannot cast vote again!"
        );
        // Casting Vote
        uint256 candidate_Index = candidate_To_array[_candidateAdd];
        candidates[candidate_Index].votes++;
        registered_Voters[voterAdd_To_ArrayIndex[msg.sender]].voted = true;
        emit success("Vote Casted Successfully!");
    }

    function EndVoting() public {
        if (msg.sender != i_owner) {
            revert Voting_OnlyOwnerCanStopVoting();
        }
        s_State = VotingState.CLOSED;

        uint256 highestVotes = 0;
        address Winner;

        for (uint256 i = 1; i < candidates.length; i++) {
            if (candidates[i].votes > highestVotes) {
                highestVotes = candidates[i].votes;
                Winner = candidates[i].public_Address;
            }
        }
        s_Winner = Winner;
        emit success("Voting Ended!");
    }

    function getWinner() public view returns (address) {
        return s_Winner;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getState() public view returns (VotingState) {
        return s_State;
    }

    function getCandidate(
        address _publicAddress
    ) public view returns (Candidate memory) {
        return candidates[candidate_To_array[_publicAddress]];
    }
}
