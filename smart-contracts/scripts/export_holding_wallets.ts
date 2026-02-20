
import { Keypair } from "@solana/web3.js";
import fs from 'fs';
import path from 'path';

const WALLETS_DIR = path.resolve(__dirname, "../wallets/distribution");

function main() {
    console.log("Scanning wallets in:", WALLETS_DIR);

    if (!fs.existsSync(WALLETS_DIR)) {
        console.error("Directory not found!");
        return;
    }

    const files = fs.readdirSync(WALLETS_DIR).filter(f => f.endsWith(".json"));
    const wallets = [];

    for (const file of files) {
        const fullPath = path.join(WALLETS_DIR, file);
        try {
            const secret = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            const kp = Keypair.fromSecretKey(new Uint8Array(secret));
            const name = file.replace(".json", ""); // Remove extension

            wallets.push({
                name: `Investor: ${name}`,
                address: kp.publicKey.toBase58(),
                type: "Holding", // Group them under Holding
                description: `Cartera de distribución privada (${name}).`
            });
        } catch (e) {
            console.error(`Failed to read ${file}:`, e);
        }
    }

    console.log(JSON.stringify(wallets, null, 2));
}

main();
