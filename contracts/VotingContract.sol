// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VotingContract {
    mapping(address => bool) public hasVoted;
    mapping(uint256 => uint256) public voteCounts;
    
    event VoteCast(address indexed voter, uint256 option);
    
    function castVote(uint256 _option) external {
        require(!hasVoted[msg.sender], 'Already voted');
        require(_option < 2, 'Invalid option');
        
        hasVoted[msg.sender] = true;
        voteCounts[_option]++;
        
        emit VoteCast(msg.sender, _option);
    }
    
    function getVoteCount(uint256 _option) external view returns (uint256) {
        return voteCounts[_option];
    }
    
    function hasUserVoted(address _user) external view returns (bool) {
        return hasVoted[_user];
    }
}