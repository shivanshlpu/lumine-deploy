import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";

export default {
    solidity: "0.8.19",
    networks: {
        sepolia: {
        url: process.env.SEPOLIA_RPC_URL || "",
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    }
};
