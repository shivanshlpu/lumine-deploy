import fs from "fs";
import dotenv from "dotenv";
import {ethers} from "ethers";
dotenv.config();

const RPC=process.env.SEPOLIA_RPC_URL;
const PK=process.env.PRIVATE_KEY;
const CONTRACT=process.env.CONTRACT_ADDRESS;

if(!RPC || !PK || !CONTRACT) {
    console.error("set SEPOLIA_RPC_URL,PRIVATE_KEY and CONTRACT_ADDRESS in .env");
    process.exit(1);
}

const pass=fs.readFileSync("pass.txt", "utf8").trim();

if(!/^0x[0-9a-fA-F]{64}$/.test(pass)){
    console.error("pass.txt does not look like a 32 byte keccak hash:",pass);
    process.exit(1);
}

const abi=[
    "function storePass(bytes32 passHash) external returns (bool)",
    "function isStored(bytes32 passHash) external view returns (bool)",
    "event PassStored(bytes32 indexed passHash, address indexed storedBy, uint256 timestamp)"
];

async function main(){
    const provider=new ethers.JsonRpcProvider(RPC);
    const signer=new ethers.Wallet(PK,provider);
    const contract=new ethers.Contract(CONTRACT,abi,signer);

    console.log("using account:",await signer.getAddress());
    console.log("calling storePass with:",pass);

    const tx=await contract.storePass(pass);
    console.log("tx sent:",tx.hash);
    const receipt=await tx.wait();
    console.log("tx mined in block",receipt.blockNumber);
    console.log("gas used:",receipt.gasUsed.toString());

    const stored=await contract.isStored(pass);
    console.log("isStored(pass) =>",stored);
}

main().catch((e)=>{
    console.error("error:",e);
    process.exit(1);
});
