
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    // Load admin
    const adminKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'))));

    // Load Holding Keypair 
    // From logs, Holding is 9vH4...
    // Let's find the file.
    const files = fs.readdirSync("./wallets/distribution").filter(f => f.includes("Holding"));
    console.log("Found files:", files);

    const holdingKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(`./wallets/distribution/master_holding.json`, 'utf8'))));
    const lxrMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'))));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const authPubkey = lxrMintKp.publicKey;
    const authXlsAta = (await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, authPubkey, true, "confirmed", {}, tokenProgramId)).address;

    console.log("--- PULLING XLS FROM HOLDING TO AUTHORITY ---");

    try {
        const ata = getAssociatedTokenAddressSync(xlsMint, holdingKp.publicKey, true, tokenProgramId);
        const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
        const bal = BigInt(acc.amount);
        const pull = 6000000n * 1000000000n; // Pull 6M

        console.log(`  - Moving 6M XLS from ${holdingKp.publicKey.toBase58()} to Authority...`);
        const tx = new Transaction().add(
            createTransferCheckedInstruction(ata, xlsMint, authXlsAta, holdingKp.publicKey, pull, 9, [], tokenProgramId)
        );
        await sendAndConfirmTransaction(connection, tx, [adminKp, holdingKp]);
    } catch (e) { console.error("Failed:", e.message); }
}
main();
