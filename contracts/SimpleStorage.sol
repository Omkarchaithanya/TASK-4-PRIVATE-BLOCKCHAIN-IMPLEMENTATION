// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleStorage {
    string private message;

    event MessageUpdated(string newMessage, address indexed updatedBy);

    constructor(string memory initialMessage) {
        message = initialMessage;
    }

    function setMessage(string calldata newMessage) external {
        message = newMessage;
        emit MessageUpdated(newMessage, msg.sender);
    }

    function getMessage() external view returns (string memory) {
        return message;
    }
}
