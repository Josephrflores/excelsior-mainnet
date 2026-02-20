const { Connection, PublicKey } = require("@solana/web3.js");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const connection = new Connection("https://api.devnet.solana.com");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

async function scan() {
    for (const mint of [LXR_MINT, XLS_MINT]) {
        console.log(`\n--- Scanning for ${mint.toBase58()} ---`);
        try {
            // Filter by dataSize (182) and mint (offset 0)
            const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
                filters: [
                    { dataSize: 182 },
                    { memcmp: { offset: 0, bytes: mint.toBase58() } }
                ]
            });

            console.log(`Found ${accounts.length} accounts.`);
            let total = 0;
            let findings = [];

            accounts.forEach(acc => {
                const data = acc.account.data;
                const amountLe = data.slice(64, 72);
                const amount = Number(amountLe.readBigUInt64LE(0)) / 1e9;
                const owner = new PublicKey(data.slice(32, 64)).toBase58();

                if (amount > 0) {
                    findings.push({ ata: acc.pubkey.toBase58(), owner, amount });
                    total += amount;
                }
            });

            findings.sort((a, b) => b.amount - a.amount);
            findings.forEach(f => {
                console.log(`  Owner: ${f.owner} | Balance: ${f.amount.toLocaleString()} | ATA: ${f.ata}`);
            });

            console.log(`GRAND TOTAL FOUND: ${total.toLocaleString()}`);
        } catch (e) {
            console.error(`Failed to scan ${mint.toBase58()}:`, e.message);
        }
    }
}

scan();
