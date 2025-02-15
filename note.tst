i use this to run some stuff

ACCOUNT_PRIVATE_KEY= private
LISK_SEPOLIA_URL=https://rpc.sepolia-api.lisk.com




npx hardhat test test/VotingSystem.ts
npx hardhat --network lisk_sepolia run scripts/interact.ts
npx hardhat --network lisk_sepolia run scripts/deploy.ts

