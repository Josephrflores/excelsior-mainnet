const { Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
const connection = new Connection("https://api.devnet.solana.com");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

async function audit() {
    const wallets = JSON.parse(fs.readFileSync("../admin-dashboard/lib/wallet-addresses.json", "utf8"));
    console.log(`Auditing ${wallets.length} wallets aggressively...`);

    let findings = [];
    let totalLxr = 0;
    let totalXls = 0;

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const w of wallets) {
        let success = false;
        let retries = 5;
        while (!success && retries > 0) {
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
                    console.log(`FOUND: ${w.name} | LXR: ${lxrBal.toLocaleString()} | XLS: ${xlsBal.toLocaleString()}`);
                    totalLxr += lxrBal;
                    totalXls += xlsBal;
                }
                success = true;
            } catch (e) {
                if (e.message.includes("429")) {
                    // console.log(`Rate limited for ${w.address}, waiting...`);
                    await delay(2000);
                    retries--;
                } else {
                    // console.error(`Error for ${w.address}:`, e.message);
                    success = true; // Skip other errors
                }
            }
        }
    }

    console.log("\n--------------------------------");
    console.log(`TOTAL SUM: LXR=${totalLxr.toLocaleString()} | XLS=${totalXls.toLocaleString()}`);

    const supplyLxr = (await connection.getTokenSupply(LXR_MINT)).value.uiAmount;
    const supplyXls = (await connection.getTokenSupply(XLS_MINT)).value.uiAmount;
    console.log(`TOTAL SUPPLY ON-CHAIN: LXR=${supplyLxr.toLocaleString()} | XLS=${supplyXls.toLocaleString()}`);
}

audit();
