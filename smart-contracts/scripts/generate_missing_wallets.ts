import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";

const WALLETS_DIR = path.join(__dirname, "../wallets/funds");

// Check if dir exists
if (!fs.existsSync(WALLETS_DIR)) {
    fs.mkdirSync(WALLETS_DIR, { recursive: true });
}

const newWallets = [
    "water_fund",
    "data_latency_fund",
    "energy_fund",
    "chips_fund",
    "talent_fund",
    "community_yield_fund"
];

newWallets.forEach(name => {
    const filePath = path.join(WALLETS_DIR, `${name}.json`);
    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${name}, already exists.`);
    } else {
        const kp = Keypair.generate();
        fs.writeFileSync(filePath, JSON.stringify(Array.from(kp.secretKey)));
        console.log(`Generated ${name}: ${kp.publicKey.toBase58()}`);
    }
});

console.log("Wallet generation complete.");
