// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Auction {
    address public owner;
    uint public auctionEndTime;
    address public highestBidder;
    uint public highestBid;
    bool public auctionEnded;

    mapping(address => uint) public bids;

    event NewBid(address bidder, uint amount);
    event Refund(address bidder, uint refundAmount);
    event AuctionEnded(address winner, uint winningBid);

    modifier onlyBeforeEnd() {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp >= auctionEndTime, "Auction has not ended");
        _;
    }

    constructor(uint _durationInSeconds) {
        owner = msg.sender;
        auctionEndTime = block.timestamp + _durationInSeconds;
    }

    function bid() public payable onlyBeforeEnd {
        require(msg.value > highestBid, "Bid must be higher than current highest bid");

        // Refund previous highest bidder with 10% bonus
        if (highestBidder != address(0)) {
            uint refundAmount = bids[highestBidder] + (msg.value * 10) / 100;
            payable(highestBidder).transfer(refundAmount);
            emit Refund(highestBidder, refundAmount);
        }

        // Update highest bid and bidder
        highestBidder = msg.sender;
        highestBid = msg.value;
        bids[msg.sender] = msg.value;

        emit NewBid(msg.sender, msg.value);
    }

    function endAuction() public onlyAfterEnd {
        require(!auctionEnded, "Auction already ended");
        auctionEnded = true;

        emit AuctionEnded(highestBidder, highestBid);
    }

    function withdraw() public {
        require(auctionEnded, "Auction has not ended");
        require(msg.sender == owner, "Only owner can withdraw");

        payable(owner).transfer(address(this).balance);
    }
}