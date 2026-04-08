import { keccak256, toUtf8Bytes } from "ethers";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";


const args = process.argv.slice(2);
if (args.length < 3) {
    console.error("Usage: node make_pass.js <phone> <aadhaar> <time_slot>");
    process.exit(1);
}

const phone = args[0];
const aadhaar = args[1];
const time_slot = args[2];
const ticketId = uuidv4();

const phonehash = keccak256(toUtf8Bytes(phone));
const aadhaarhash = keccak256(toUtf8Bytes(aadhaar));
const ticketIdhash = keccak256(toUtf8Bytes(ticketId));

const qr_text =
    "temple pass\n" +
    "slot: " + time_slot + "\n" +
    "user: " + phonehash + "\n" +
    "aadhaar: " + aadhaarhash + "\n" +
    "ticket: " + ticketIdhash + "\n";

const pass = keccak256(toUtf8Bytes(qr_text));

console.log("QR Data:", qr_text);
console.log("Pass Hash:", pass);

fs.writeFileSync("pass.txt", pass);

QRCode.toFile("temple_pass.png", qr_text, { width: 600 }, () => {
    console.log("qr generated");
});
