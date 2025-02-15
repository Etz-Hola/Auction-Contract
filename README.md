# Qadir Adesoye Auction Contract

A Solidity smart contract for a lossless auction where outbid users receive their bid back plus 10% of the new highest bid.

## Features
- Users can place bids on an item.
- Outbid users receive a refund + 10% of the new bid.
- Auction ends after a set duration.
- Owner can withdraw funds after the auction ends.

## Setup
1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Deploy locally: `npm run deploy`

## Testing
Tests cover bidding, refunds, auction ending, and fund withdrawal.