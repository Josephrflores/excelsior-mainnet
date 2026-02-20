const { Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
const connection = new Connection("https://api.devnet.solana.com");

async function audit() {
    try {
        const wallets = JSON.parse(fs.readFileSync("/home/itsroosevelt_/excelsior-project/admin-dashboard/lib/wallet-addresses.json", "utf8"));
        console.log(`Auditing ${wallets.length} wallets...`);

        for (const w of wallets) {
            try {
                const owner = new PublicKey(w.address);

                // Get balances
                const accounts = await connection.getParsedTokenAccountsByOwner(owner, { programId: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") });

                let lxrBal = 0;
                let xlsBal = 0;

                accounts.value.forEach(acc => {
                    const info = acc.account.data.parsed.info;
                    if (info.mint === LXR_MINT.toBase58()) {
                        lxrBal += info.tokenAmount.uiAmount || 0;
                    } else if (info.mint === XLS_MINT.toBase58()) {
                        xlsBal += info.tokenAmount.uiAmount || 0;
                    }
                });

                if (lxrBal > 0 || xlsBal > 0) {
                    console.log(`MATCH: ${w.name} (${w.address}) | LXR=${lxrBal} | XLS=${xlsBal}`);
                }
            } catch (e) {
                console.error(`Error auditing ${w.address}:`, e.message);
            }
        }
    } catch (e) {
        console.error("Critical error in audit:", e.message);
    }
    console.log("Audit complete.");
}

audit();
