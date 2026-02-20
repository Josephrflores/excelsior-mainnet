const { Connection, PublicKey } = require("@solana/web3.js");

const connection = new Connection("https://api.devnet.solana.com");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

async function findLargest() {
    const mint = LXR_MINT;
    console.log(`\n--- Largest non-zero accounts for ${mint.toBase58()} (LXR) ---`);
    const resp = await connection.getTokenLargestAccounts(mint);
    for (const account of resp.value) {
        if (account.uiAmount > 0) {
            try {
                const accInfo = await connection.getParsedAccountInfo(account.address);
                const owner = accInfo.value?.data.parsed.info.owner;
                const isAta = accInfo.value?.data.parsed.info.isAssociated;
                console.log(`  Balance: ${account.uiAmount.toLocaleString()} | Owner: ${owner} | ATA: ${isAta} | Account: ${account.address.toBase58()}`);
            } catch (e) {
                console.log(`  Balance: ${account.uiAmount.toLocaleString()} | Account: ${account.address.toBase58()} (Metadata fetch failed)`);
            }
        }
    }
}

findLargest().catch(console.error);
