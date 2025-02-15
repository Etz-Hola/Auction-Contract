# Qadir Adesoye Auction Contract

## Overview
The `Auction` smart contract is a lossless auction system where bidders can place bids, and outbid participants receive their bid back along with a 10% bonus from the new highest bid. The contract allows the auction owner to withdraw funds after the auction ends and provides a pausing mechanism for emergency situations.

## Features
- **Bidding System**: Users can place bids, with each new highest bidder outbidding the previous highest bidder.
- **Refund Mechanism**: Previous highest bidders receive their bid back plus 10% of the new highest bid.
- **Auction Duration**: The auction runs for a specified period set at deployment.
- **Owner Withdrawals**: The contract owner can withdraw funds once the auction ends.
- **Emergency Pause**: The owner can pause and resume the auction if necessary.
- **Auction Status Check**: Users can retrieve auction details, including time remaining and whether it's paused.

## Contract Details
### State Variables
- `owner`: Address of the auction owner.
- `auctionEndTime`: The timestamp when the auction ends.
- `highestBidder`: Address of the current highest bidder.
- `highestBid`: The highest bid amount.
- `auctionEnded`: Boolean flag indicating if the auction has ended.
- `paused`: Boolean flag indicating if the auction is paused.
- `bids`: Mapping to track bidder addresses and their bid amounts.

### Events
- `AuctionInitialized`: Emitted when the auction starts.
- `NewBid`: Emitted when a new highest bid is placed.
- `Refund`: Emitted when a previous highest bidder is refunded.
- `AuctionEnded`: Emitted when the auction ends.
- `FundsWithdrawn`: Emitted when the owner withdraws funds.
- `AuctionPaused`: Emitted when the auction is paused or resumed.

## Functions
### Constructor
```solidity
constructor(uint _durationInSeconds)
```
Initializes the auction with a specified duration.

### Bidding
```solidity
function bid() public payable
```
Allows users to place bids. The previous highest bidder receives a refund plus 10% of the new bid.

### Ending the Auction
```solidity
function endAuction() public
```
Ends the auction once the duration has passed.

### Withdrawing Funds
```solidity
function withdraw() public
```
Allows the contract owner to withdraw funds after the auction ends.

### Pausing/Unpausing Auction
```solidity
function setPaused(bool _paused) public
```
Lets the owner pause or resume the auction.

### Checking Auction Status
```solidity
function getAuctionStatus() public view returns (uint, uint, bool, bool)
```
Returns auction end time, time remaining, whether the auction has ended, and whether it is paused.

## Usage
1. Deploy the contract with a desired auction duration.
2. Users place bids using the `bid()` function.
3. The auction ends when the set time is reached.
4. The owner can withdraw funds after the auction ends.
5. The owner can pause/unpause the auction if needed.

## Security Considerations
- **Reentrancy Protection**: Refunds and withdrawals use `call` but ensure state updates happen before transfers.
- **Access Control**: Only the owner can pause/unpause the auction and withdraw funds.
- **Auction Validations**: Bids must be higher than the current highest bid, and auctions cannot be ended prematurely.

## License
This contract is licensed under the MIT License.

