import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const { LISK_SEPOLIA_URL, ACCOUNT_PRIVATE_KEY_1, ACCOUNT_PRIVATE_KEY_2, ACCOUNT_PRIVATE_KEY_3 } = process.env;

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        lisk_sepolia: {
            url: LISK_SEPOLIA_URL || "https://rpc.sepolia-api.lisk.com", // Fallback URL if env variable is missing
            accounts: [
                `0x${ACCOUNT_PRIVATE_KEY_1 || "0000000000000000000000000000000000000000000000000000000000000000"}`, // Fallback to dummy key
                `0x${ACCOUNT_PRIVATE_KEY_2 || "0000000000000000000000000000000000000000000000000000000000000000"}`, // Fallback to dummy key
                `0x${ACCOUNT_PRIVATE_KEY_3 || "0000000000000000000000000000000000000000000000000000000000000000"}`, // Fallback to dummy key
            ],
            chainId: 4202,
        },
    },
    etherscan: {
        apiKey: {
            "lisk-sepolia": "123", // Replace with your actual API key if needed
        },
        customChains: [
            {
                network: "lisk-sepolia",
                chainId: 4202,
                urls: {
                    apiURL: "https://sepolia-blockscout.lisk.com/api",
                    browserURL: "https://sepolia-blockscout.lisk.com",
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
};

export default config;