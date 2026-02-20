const { Connection, PublicKey } = require("@solana/web3.js");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const connection = new Connection("https://api.devnet.solana.com");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

async function scan() {
    for (const mint of [LXR_MINT, XLS_MINT]) {
        console.log(`\n--- Scanning for ${mint.toBase58()} ---`);
        try {
            const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
                filters: [
                    { memcmp: { offset: 0, bytes: mint.toBase58() } }
                ]
            });
            console.log(`Found ${accounts.length} total accounts.`);
            let total = 0;
            accounts.forEach(acc => {
                const data = acc.account.data;
                if (data.length < 165) return; // Not a full token account

                // Token account Layout:
                // Mint: 0-32
                // Owner: 32-64
                // Amount: 64-72 (u64)

                const amountLe = data.slice(64, 72);
                const amount = Number(amountLe.readBigUInt64LE(0)) / 1e9;
                const owner = new PublicKey(data.slice(32, 64)).toBase58();

                if (amount > 0) {
                    console.log(`  ATA: ${acc.pubkey.toBase58()} | Owner: ${owner} | Balance: ${amount.toLocaleString()}`);
                    total += amount;
                }
            });
            console.log(`GRAND TOTAL FOR ${mint.toBase58()}: ${total.toLocaleString()}`);
        } catch (e) {
            console.error(`Failed to scan ${mint.toBase58()}:`, e.message);
        }
    }
}

scan();
