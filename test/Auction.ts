import { expect } from "chai";
import { ethers } from "hardhat";

describe("Auction", function () {
    let auction: any;
    let owner: any;
    let bidder1: any;
    let bidder2: any;
    const auctionDuration = 3600; // 1 hour in seconds

    beforeEach(async function () {
        // Get signers
        [owner, bidder1, bidder2] = await ethers.getSigners();

        // Deploy the contract
        const LosslessAuction = await ethers.getContractFactory("LosslessAuction");
        auction = await LosslessAuction.deploy(auctionDuration);
    });

    describe("bid function", function () {
        it("should allow bidding and track highest bid", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });

            expect(await auction.highestBidder()).to.equal(bidder1.address);
            expect(await auction.highestBid()).to.equal(bidAmount);
        });

        it("should refund outbid bidder with 10% bonus", async function () {
            const bid1 = ethers.parseEther("1");
            const bid2 = ethers.parseEther("2");

            // Bidder 1 bids
            await auction.connect(bidder1).bid({ value: bid1 });

            // Bidder 2 outbids
            const initialBalance = await ethers.provider.getBalance(bidder1.address);
            await auction.connect(bidder2).bid({ value: bid2 });

            // Check refund (bid1 + 10% of bid2)
            const expectedRefund = bid1 + (bid2 * BigInt(10)) / BigInt(100);
            const finalBalance = await ethers.provider.getBalance(bidder1.address);

            expect(finalBalance).to.be.closeTo(
                initialBalance + expectedRefund,
                ethers.parseEther("0.01")
            );
        });

        it("should not allow bids after auction ends", async function () {
            // Fast forward time past auction end
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            const bidAmount = ethers.parseEther("1");
            await expect(
                auction.connect(bidder1).bid({ value: bidAmount })
            ).to.be.revertedWith("Auction has ended");
        });
    });

    describe("endAuction function", function () {
        it("should end auction after duration", async function () {
            // Fast forward time past auction end
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            expect(await auction.auctionEnded()).to.be.true;
        });
    });

    describe("withdraw function", function () {
        it("should allow owner to withdraw funds after auction ends", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });

            // Fast forward time past auction end
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            const initialBalance = await ethers.provider.getBalance(owner.address);
            await auction.withdraw();

            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.greaterThan(initialBalance);
        });

        it("should not allow non-owner to withdraw funds", async function () {
            const bidAmount = ethers.parseEther("1");
            await auction.connect(bidder1).bid({ value: bidAmount });

            // Fast forward time past auction end
            await ethers.provider.send("evm_increaseTime", [auctionDuration + 1]);
            await ethers.provider.send("evm_mine");

            await auction.endAuction();
            await expect(
                auction.connect(bidder1).withdraw()
            ).to.be.revertedWith("Only owner can withdraw");
        });
    });
});