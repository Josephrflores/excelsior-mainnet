import { Connection, PublicKey } from "@solana/web3.js";
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const connection = new Connection("https://api.devnet.solana.com");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

async function scan() {
    for (const mint of [LXR_MINT, XLS_MINT]) {
        console.log(`\nScanning for ${mint.toBase58()}...`);
        const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
            filters: [
                { memcmp: { offset: 0, bytes: mint.toBase58() } }
            ]
        });
        console.log(`Found ${accounts.length} accounts.`);
        let total = 0n;
        accounts.forEach(acc => {
            const data = acc.account.data;
            const amount = data.readBigUInt64LE(64);
            const owner = new PublicKey(data.slice(32, 64));
            if (amount > 0n) {
                console.log(`  Account: ${acc.pubkey.toBase58()} | Owner: ${owner.toBase58()} | Amount: ${Number(amount) / 1e9}`);
                total += amount;
            }
        });
        console.log(`Total found for ${mint.toBase58()}: ${Number(total) / 1e9}`);
    }
}

scan().catch(console.error);
