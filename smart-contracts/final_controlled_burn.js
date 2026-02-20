const { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const { getAssociatedTokenAddressSync, createBurnInstruction, TOKEN_2022_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

// Targets (60/20/10/9/1 of 2.025B / 20.25M)
const TARGETS = {
    "Hf4rcgDXFKtJ4kskxqThTYtGVPHHQCnn1xopPxa6ofUc": { name: "Reserve", lxr: 1215000000, xls: 12150000, key: "wallets/distribution/Roosevelt.json" },
    "9vH4YyXrCAFe47eQ5pKn9tHkmU7SWJg5z84TUamLRdKA": { name: "Holding", lxr: 405000000, xls: 4050000, key: "wallets/master_holding.json" },
    "B4oFz3PjG8psJsZotesJmT9W33Qz3fzYY2NWkvUjcTRF": { name: "Operations", lxr: 202500000, xls: 2025000, key: "wallets/master_operations.json" },
    "FC6ZGDNiXiLcdUb4c6VGqtAoP1Dx5PaUtFVu1oNEunX7": { name: "Lock", lxr: 182250000, xls: 1822500, key: "wallets/founder_vault.json" },
    "7za4bCkZAzkVxaJrfH7iP1NetETqsp6iPe9GN9jtu4UG": { name: "Personal", lxr: 20250000, xls: 202500, key: "wallets/distribution/Roosevelt_Personal.json" }
};

async function executeBurn() {
    console.log("--- STARTING FINAL CONTROLLED BURN (Admin as Payer) ---");

    const adminSecret = JSON.parse(fs.readFileSync("wallets/admin.json", "utf8"));
    const adminPayer = Keypair.fromSecretKey(new Uint8Array(adminSecret));
    console.log(`Using Admin Payer: ${adminPayer.publicKey.toBase58()} (Balance: ${(await connection.getBalance(adminPayer.publicKey)) / 1e9} SOL)`);

    for (const [addr, info] of Object.entries(TARGETS)) {
        console.log(`\nChecking ${info.name} (${addr})...`);
        const secret = JSON.parse(fs.readFileSync(info.key, "utf8"));
        const ownerKp = Keypair.fromSecretKey(new Uint8Array(secret));

        // LXR
        try {
            const ata = getAssociatedTokenAddressSync(LXR_MINT, ownerKp.publicKey, true, TOKEN_2022_PROGRAM_ID);
            const balResp = await connection.getTokenAccountBalance(ata);
            const current = balResp.value.uiAmount || 0;
            const target = info.lxr;
            const diff = current - target;

            if (diff > 0.000001) {
                const amount = BigInt(Math.floor(diff * 1e9));
                console.log(`  Burning ${diff.toLocaleString()} LXR...`);
                const tx = new Transaction().add(createBurnInstruction(ata, LXR_MINT, ownerKp.publicKey, amount, [], TOKEN_2022_PROGRAM_ID));
                tx.feePayer = adminPayer.publicKey;
                tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

                await sendAndConfirmTransaction(connection, tx, [adminPayer, ownerKp]);
                console.log(`  LXR Burn Success.`);
            } else {
                console.log(`  LXR Balance OK (${current.toLocaleString()}).`);
            }
        } catch (e) { console.error(`  LXR Error: ${e.message}`); }

        // XLS
        try {
            const ata = getAssociatedTokenAddressSync(XLS_MINT, ownerKp.publicKey, true, TOKEN_2022_PROGRAM_ID);
            const balResp = await connection.getTokenAccountBalance(ata);
            const current = balResp.value.uiAmount || 0;
            const target = info.xls;
            const diff = current - target;

            if (diff > 0.000001) {
                const amount = BigInt(Math.floor(diff * 1e9));
                console.log(`  Burning ${diff.toLocaleString()} XLS...`);
                const tx = new Transaction().add(createBurnInstruction(ata, XLS_MINT, ownerKp.publicKey, amount, [], TOKEN_2022_PROGRAM_ID));
                tx.feePayer = adminPayer.publicKey;
                tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

                await sendAndConfirmTransaction(connection, tx, [adminPayer, ownerKp]);
                console.log(`  XLS Burn Success.`);
            } else {
                console.log(`  XLS Balance OK (${current.toLocaleString()}).`);
            }
        } catch (e) { console.error(`  XLS Error: ${e.message}`); }
    }

    console.log("\n--- FINISHED BURN ---");
}

executeBurn().catch(console.error);
