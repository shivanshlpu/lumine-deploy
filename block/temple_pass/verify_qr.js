import Jimp from "jimp";
import QrCode from "qrcode-reader";
import fs from "fs";
import dotenv from "dotenv";
import {ethers,keccak256,toUtf8Bytes} from "ethers";

dotenv.config();

if(process.argv.length<3){
    console.error("usage:node verify_qr.js <path-to-qr-image>");
    process.exit(1);
}

const imgPath=process.argv[2];
const RPC=process.env.SEPOLIA_RPC_URL;
const CONTRACT=process.env.CONTRACT_ADDRESS;

if(!RPC || !CONTRACT){
    console.error("set SEPOLIA_RPC_URL and CONTRACT_ADDRESS in .env");
    process.exit(1);
}

function decodeQRCodeFromImage(path){
    return new Promise((resolve,reject)=>{
        Jimp.read(path)
        .then((image)=>{
            const qr=new QrCode();
            qr.callback=function(err,value){
            if(err) return reject(err);
            resolve(value.result);
            };
            qr.decode(image.bitmap);
        })
        .catch(reject);
    });
}

async function main(){
    try{
        const qrText=await decodeQRCodeFromImage(imgPath);
        console.log("decoded QR text:\n",qrText,"\n");

        const hash=keccak256(toUtf8Bytes(qrText));
        console.log("computed hash:",hash,"\n");

        const abi=[
        "function isStored(bytes32) view returns (bool)"
        ];

        const provider=new ethers.JsonRpcProvider(RPC);
        const contract=new ethers.Contract(CONTRACT,abi,provider);

        const stored=await contract.isStored(hash);
        console.log("valid on chain:",stored ? "yes" : "no");

    }catch(e){
        console.error("error:",e);
    }
}

main();
