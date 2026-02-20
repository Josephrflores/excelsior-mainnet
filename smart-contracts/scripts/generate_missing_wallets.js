const { Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

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

// Map 'Reinvestment' to existing RWA Vault if needed, or create new?
// User said "comprar mas propiedades" -> Reinvestment.
// I'll create a dedicated reinvestment_fund.json to be clean, 
// and if we need to link it to rwa_vault later we can, but let's have a dedicated key.
// Wait, I updated Init to use `reinvestment_wallet`.
// Let's create `reinvestment_fund.json`.

newWallets.push("reinvestment_fund");

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
