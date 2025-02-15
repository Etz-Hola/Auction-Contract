// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


contract Auction {
    // State variables
    address public immutable owner; 
    uint public immutable auctionEndTime; 
    address public highestBidder; 
    uint public highestBid; 
    bool public auctionEnded;
    bool public paused; 

    mapping(address => uint) public bids; 

    // Events
    event AuctionInitialized(address indexed owner, uint duration, uint endTime);
    event NewBid(address indexed bidder, uint amount);
    event Refund(address indexed bidder, uint refundAmount);
    event AuctionEnded(address indexed winner, uint winningBid);
    event FundsWithdrawn(address indexed owner, uint amount);
    event AuctionPaused(bool paused);

    // Modifiers
    modifier onlyBeforeEnd() {
        require(block.timestamp < auctionEndTime, "Auction has ended");
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp >= auctionEndTime, "Auction has not ended");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Auction is paused");
        _;
    }

  
    constructor(uint _durationInSeconds) {
        require(_durationInSeconds > 0, "Duration must be greater than zero");

        owner = msg.sender;
        auctionEndTime = block.timestamp + _durationInSeconds;

        emit AuctionInitialized(owner, _durationInSeconds, auctionEndTime);
    }

    function bid() public payable onlyBeforeEnd whenNotPaused {
        require(msg.value > highestBid, "Bid must be higher than current highest bid");

        // Refund previous highest bidder with 10% bonus
        if (highestBidder != address(0)) {
            uint refundAmount = bids[highestBidder] + (msg.value * 10) / 100;
            (bool success, ) = payable(highestBidder).call{value: refundAmount}("");
            require(success, "Refund failed");
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

    function withdraw() public onlyAfterEnd onlyOwner {
        require(auctionEnded, "Auction has not ended");

        uint balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner, balance);
    }

   
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
        emit AuctionPaused(_paused);
    }

    
    function getAuctionStatus() public view returns (
        uint endTime,
        uint timeRemaining,
        bool isEnded,
        bool isPaused
    ) {
        endTime = auctionEndTime;
        timeRemaining = block.timestamp < auctionEndTime ? auctionEndTime - block.timestamp : 0;
        isEnded = auctionEnded;
        isPaused = paused;
    }
}