const { Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
const connection = new Connection("https://api.devnet.solana.com");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

async function auditAndMap() {
    console.log("Starting audit and key mapping...");

    // 1. Load all local keypairs to map addresses to files
    const keyMap = {};
    const walletDirs = ["./wallets", "./wallets/distribution"];
    for (const dir of walletDirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file.endsWith(".json")) {
                try {
                    const secret = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
                    if (Array.isArray(secret)) {
                        const { Keypair } = require("@solana/web3.js");
                        const kp = Keypair.fromSecretKey(new Uint8Array(secret));
                        keyMap[kp.publicKey.toBase58()] = path.join(dir, file);
                    }
                } catch (e) { }
            }
        }
    }

    // 2. Load wallet registry/addresses
    const addressesFile = "../admin-dashboard/lib/wallet-addresses.json";
    const wallets = JSON.parse(fs.readFileSync(addressesFile, "utf8"));

    console.log(`Auditing ${wallets.length} wallets...`);

    let findings = [];

    // Process in batches to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
        const batch = wallets.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (w) => {
            try {
                const owner = new PublicKey(w.address);
                const accounts = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID });

                let lxrBal = 0;
                let xlsBal = 0;

                accounts.value.forEach(acc => {
                    const info = acc.account.data.parsed.info;
                    if (info.mint === LXR_MINT.toBase58()) lxrBal += info.tokenAmount.uiAmount || 0;
                    if (info.mint === XLS_MINT.toBase58()) xlsBal += info.tokenAmount.uiAmount || 0;
                });

                if (lxrBal > 0 || xlsBal > 0) {
                    findings.push({
                        name: w.name,
                        address: w.address,
                        lxr: lxrBal,
                        xls: xlsBal,
                        keyFile: keyMap[w.address] || "UNKNOWN"
                    });
                }
            } catch (e) { }
        }));
        if (i % 50 === 0) console.log(`Processed ${i} wallets...`);
    }

    console.log("\n--- AUDIT RESULTS ---");
    findings.sort((a, b) => b.lxr - a.lxr);
    findings.forEach(f => {
        console.log(`${f.name} (${f.address})`);
        console.log(`  LXR: ${f.lxr.toLocaleString()} | XLS: ${f.xls.toLocaleString()}`);
        console.log(`  Keyfile: ${f.keyFile}`);
    });

    const totalLxr = findings.reduce((sum, f) => sum + f.lxr, 0);
    const totalXls = findings.reduce((sum, f) => sum + f.xls, 0);
    console.log("\n--------------------------------");
    console.log(`TOTAL FOUND: LXR=${totalLxr.toLocaleString()} | XLS=${totalXls.toLocaleString()}`);
}

auditAndMap().catch(console.error);
