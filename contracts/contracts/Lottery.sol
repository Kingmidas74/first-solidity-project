// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.9;
 
contract Lottery {
    address public manager;
    address payable[] public players;
    
    constructor() {
        manager = msg.sender; 
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(payable(msg.sender));
    }

    function pickWinner() public restricted {
        require(players.length > 0);        

        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address payable[](0);
    }

    function getPlayers() public view returns(address payable[] memory){
        return players;
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}