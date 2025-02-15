import { ethers } from "hardhat";

async function main() {
    try {
        // Get signers (accounts for interaction)
        const signers = await ethers.getSigners();
        if (signers.length < 3) {
            throw new Error(
                `Insufficient accounts available. Found ${signers.length}, but at least 3 are required. Please configure more accounts in hardhat.config.ts.`
            );
        }

        const [owner, bidder1, bidder2] = signers;
        const ownerAddress = await owner.getAddress();
        const bidder1Address = await bidder1.getAddress();
        const bidder2Address = await bidder2.getAddress();

        console.log("Owner address:", ownerAddress);
        console.log("Bidder 1 address:", bidder1Address);
        console.log("Bidder 2 address:", bidder2Address);

        // Check account balances to ensure they have enough funds
        const ownerBalance = await ethers.provider.getBalance(ownerAddress);
        const bidder1Balance = await ethers.provider.getBalance(bidder1Address);
        const bidder2Balance = await ethers.provider.getBalance(bidder2Address);

        console.log("Owner balance:", ethers.formatEther(ownerBalance), "ETH");
        console.log("Bidder 1 balance:", ethers.formatEther(bidder1Balance), "ETH");
        console.log("Bidder 2 balance:", ethers.formatEther(bidder2Balance), "ETH");

        // Check if accounts have sufficient funds for bidding
        const minBalance = ethers.parseEther("0.002"); // Lowered minimum balance to 0.02 ETH
        if (ownerBalance < minBalance || bidder1Balance < minBalance || bidder2Balance < minBalance) {
            throw new Error("One or more accounts have insufficient funds. Please fund the accounts on Lisk Sepolia.");
        }

        // Deploy the Auction contract
        const auctionDuration = 3600; // 1 hour in seconds
        const Auction = await ethers.getContractFactory("Auction");
        const auction = await Auction.deploy(auctionDuration);
        await auction.waitForDeployment();

        console.log("Auction deployed to:", auction.target);

        // Helper function to display auction status
        async function displayAuctionStatus() {
            const [endTime, timeRemaining, isEnded, isPaused] = await auction.getAuctionStatus();
            console.log("\nAuction Status:");
            console.log("  End Time:", endTime.toString());
            console.log("  Time Remaining:", timeRemaining.toString(), "seconds");
            console.log("  Is Ended:", isEnded);
            console.log("  Is Paused:", isPaused);
            console.log("  Highest Bidder:", await auction.highestBidder());
            console.log("  Highest Bid:", ethers.formatEther(await auction.highestBid()), "ETH");
        }

        // Display initial auction status
        console.log("\n=== Initial Auction Status ===");
        await displayAuctionStatus();

        // Bidder 1 places a bid of 0.01 ETH
        console.log("\n=== Bidder 1 Places Bid ===");
        const bid1Amount = ethers.parseEther("0.001");
        await auction.connect(bidder1).bid({ value: bid1Amount });
        console.log(`Bidder 1 placed a bid of ${ethers.formatEther(bid1Amount)} ETH`);
        await displayAuctionStatus();

        // Bidder 2 outbids with 0.02 ETH
        console.log("\n=== Bidder 2 Outbids ===");
        const bid2Amount = ethers.parseEther("0.002");
        const bidder1InitialBalance = await ethers.provider.getBalance(bidder1Address);
        await auction.connect(bidder2).bid({ value: bid2Amount });
        const bidder1FinalBalance = await ethers.provider.getBalance(bidder1Address);
        const refundAmount = bidder1FinalBalance - bidder1InitialBalance + bid1Amount;
        console.log(`Bidder 2 placed a bid of ${ethers.formatEther(bid2Amount)} ETH`);
        console.log(`Bidder 1 received refund with 10% bonus: ${ethers.formatEther(refundAmount)} ETH`);
        await displayAuctionStatus();

        // Owner pauses the auction
        console.log("\n=== Owner Pauses Auction ===");
        await auction.connect(owner).setPaused(true);
        console.log("Auction paused by owner");
        await displayAuctionStatus();

        // Attempt to bid while paused (should fail)
        console.log("\n=== Attempting Bid While Paused ===");
        try {
            await auction.connect(bidder1).bid({ value: ethers.parseEther("0.003") });
        } catch (error: any) {
            console.log("Bid failed as expected:", error.message);
        }

        // Owner unpauses the auction
        console.log("\n=== Owner Unpauses Auction ===");
        await auction.connect(owner).setPaused(false);
        console.log("Auction unpaused by owner");
        await displayAuctionStatus();

        // Fast forward time to end the auction (not possible on live networks, skipping)
        console.log("\n=== Note: Cannot fast forward time on live network (Lisk Sepolia) ===");
        console.log("Please wait for the auction duration (1 hour) to end, then run endAuction and withdraw manually.");

        // For demonstration, assume the auction has ended (manual intervention required on live network)
        console.log("\n=== Manual Steps for Ending Auction and Withdrawal ===");
        console.log("1. Wait for auction duration to end.");
        console.log(`2. Call endAuction() using: npx hardhat run scripts/endAuction.ts --network lisk_sepolia`);
        console.log(`3. Call withdraw() using: npx hardhat run scripts/withdraw.ts --network lisk_sepolia`);

        // Display final auction status
        console.log("\n=== Current Auction Status ===");
        await displayAuctionStatus();

        // Final summary
        console.log("\n=== Final Summary ===");
        console.log("Contract Balance:", ethers.formatEther(await ethers.provider.getBalance(auction.target)), "ETH");
        console.log("Owner Balance:", ethers.formatEther(await ethers.provider.getBalance(ownerAddress)), "ETH");
        console.log("Bidder 1 Balance:", ethers.formatEther(await ethers.provider.getBalance(bidder1Address)), "ETH");
        console.log("Bidder 2 Balance:", ethers.formatEther(await ethers.provider.getBalance(bidder2Address)), "ETH");
    } catch (error: any) {
        console.error("Error occurred:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Unhandled error:", error);
        process.exit(1);
    });