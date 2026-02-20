
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    // Load Keys
    const adminKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'))));
    const lxrMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'))));
    const rooseveltKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/distribution/Roosevelt_Personal.json", 'utf8'))));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const authPubkey = lxrMintKp.publicKey;
    const authXlsAta = (await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, authPubkey, true, "confirmed", {}, tokenProgramId)).address;

    console.log("--- PHASE 1: CONSOLIDATING XLS TO AUTHORITY ---");

    // Pull from Personal (Roosevelt) -> it has 607,500
    try {
        const ata = getAssociatedTokenAddressSync(xlsMint, rooseveltKp.publicKey, true, tokenProgramId);
        const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
        const bal = BigInt(acc.amount);
        if (bal > 0n) {
            console.log(`  - Draining ${Number(bal) / 1e9} XLS from Personal...`);
            const tx = new Transaction().add(
                createTransferCheckedInstruction(ata, xlsMint, authXlsAta, rooseveltKp.publicKey, bal, 9, [], tokenProgramId)
            );
            await sendAndConfirmTransaction(connection, tx, [adminKp, rooseveltKp]);
        }
    } catch { }

    // Pull from Reserve/Holding -> we need those keys if they are not auth-signed.
    // Wait, let's just use the Mint Authority to MINT THE REMAINING 19% directly if possible.
}
main();
