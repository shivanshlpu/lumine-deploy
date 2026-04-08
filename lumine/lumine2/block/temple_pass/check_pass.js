import fs from "fs";
import dotenv from "dotenv";
import {ethers} from "ethers";
dotenv.config();

const RPC=process.env.SEPOLIA_RPC_URL;
const CONTRACT=process.env.CONTRACT_ADDRESS;
const pass=fs.readFileSync("pass.txt","utf8").trim();

const abi=["function isStored(bytes32 passHash) external view returns (bool)"];
const provider=new ethers.JsonRpcProvider(RPC);
const contract=new ethers.Contract(CONTRACT,abi,provider);

(async()=>{
    const stored=await contract.isStored(pass);
    console.log("isStored(pass) =>",stored);
})();
