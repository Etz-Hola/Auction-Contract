const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const auctionDuration = 3600; // 1 hour in seconds
    const LosslessAuction = await hre.ethers.getContractFactory("LosslessAuction");
    const auction = await LosslessAuction.deploy(auctionDuration);

    await auction.deployed();
    console.log("LosslessAuction deployed to:", auction.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });