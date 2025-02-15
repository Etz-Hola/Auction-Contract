// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title Auction
 * @dev A lossless auction contract where outbid bidders receive their bid back plus 10% of the new highest bid.
 */
contract Auction {
    // State variables
    address public immutable owner; // Owner of the auction (immutable for gas efficiency)
    uint public immutable auctionEndTime; // End time of the auction (immutable for gas efficiency)
    address public highestBidder; // Current highest bidder
    uint public highestBid; // Current highest bid
    bool public auctionEnded; // Flag indicating if the auction has ended
    bool public paused; // Flag for emergency pause

    mapping(address => uint) public bids; // Mapping of bidder addresses to their bids

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

    /**
     * @dev Initializes the auction with a duration in seconds.
     * @param _durationInSeconds Duration of the auction in seconds.
     */
    constructor(uint _durationInSeconds) {
        require(_durationInSeconds > 0, "Duration must be greater than zero");

        owner = msg.sender;
        auctionEndTime = block.timestamp + _durationInSeconds;

        emit AuctionInitialized(owner, _durationInSeconds, auctionEndTime);
    }

    /**
     * @dev Places a bid on the auction. Outbid bidders receive a refund plus 10% of the new bid.
     */
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

    /**
     * @dev Ends the auction after the duration has passed.
     */
    function endAuction() public onlyAfterEnd {
        require(!auctionEnded, "Auction already ended");
        auctionEnded = true;

        emit AuctionEnded(highestBidder, highestBid);
    }

    /**
     * @dev Allows the owner to withdraw funds after the auction ends.
     */
    function withdraw() public onlyAfterEnd onlyOwner {
        require(auctionEnded, "Auction has not ended");

        uint balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @dev Allows the owner to pause or unpause the auction in case of emergencies.
     * @param _paused True to pause, false to unpause.
     */
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
        emit AuctionPaused(_paused);
    }

    /**
     * @dev Returns the current status of the auction.
     * @return endTime The end time of the auction.
     * @return timeRemaining The time remaining until the auction ends (or 0 if ended).
     * @return isEnded Whether the auction has ended.
     * @return isPaused Whether the auction is paused.
     */
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