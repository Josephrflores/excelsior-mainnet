import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection("https://api.devnet.solana.com");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

async function scan() {
    console.log("Scanning LXR accounts...");
    const lxrAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        filters: [
            { dataSize: 182 }, // Token account size
            { memcmp: { offset: 0, bytes: LXR_MINT.toBase58() } }
        ]
    });
    console.log(`Found ${lxrAccounts.length} LXR accounts.`);
    lxrAccounts.forEach(acc => {
        const data = acc.account.data;
        const amount = data.readBigUInt64LE(64);
        const owner = new PublicKey(data.slice(32, 64));
        if (amount > 0n) {
            console.log(`  LXR Account: ${acc.pubkey.toBase58()} | Owner: ${owner.toBase58()} | Amount: ${Number(amount) / 1e9}`);
        }
    });

    console.log("\nScanning XLS accounts...");
    const xlsAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
        filters: [
            { dataSize: 182 },
            { memcmp: { offset: 0, bytes: XLS_MINT.toBase58() } }
        ]
    });
    console.log(`Found ${xlsAccounts.length} XLS accounts.`);
    xlsAccounts.forEach(acc => {
        const data = acc.account.data;
        const amount = data.readBigUInt64LE(64);
        const owner = new PublicKey(data.slice(32, 64));
        if (amount > 0n) {
            console.log(`  XLS Account: ${acc.pubkey.toBase58()} | Owner: ${owner.toBase58()} | Amount: ${Number(amount) / 1e9}`);
        }
    });
}

scan().catch(console.error);
