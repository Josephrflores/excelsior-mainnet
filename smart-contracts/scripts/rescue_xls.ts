
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

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const authPubkey = lxrMintKp.publicKey;
    const authXlsAta = (await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, authPubkey, true, "confirmed", {}, tokenProgramId)).address;

    const lockFundPubkey = new PublicKey(WALLET_REGISTRY.founder_lock_fund); // FC6Z...
    const opsFundPubkey = new PublicKey(WALLET_REGISTRY.operations_fund);   // B4oF...

    const xls9Percent = 5467500n * 1000000000n;
    const xls10Percent = 6075000n * 1000000000n;

    console.log("--- FINAL XLS RESCUE & SYNC ---");

    // 1. Re-fill from Authority (Now has 607k + any excess)
    const targets = [
        { name: "Lock (9%)", pub: lockFundPubkey, target: xls9Percent },
        { name: "Ops (10%)", pub: opsFundPubkey, target: xls10Percent }
    ];

    for (const t of targets) {
        try {
            const ata = (await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, t.pub, true, "confirmed", {}, tokenProgramId));
            const cur = BigInt(ata.amount);
            if (cur < t.target) {
                const diff = t.target - cur;
                console.log(`  - Moving ${Number(diff) / 1e9} XLS to ${t.name}...`);
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(authXlsAta, xlsMint, ata.address, authPubkey, diff, 9, [], tokenProgramId)
                );
                await sendAndConfirmTransaction(connection, tx, [adminKp, lxrMintKp]);
            } else {
                console.log(`  - ${t.name} XLS is OK.`);
            }
        } catch (e) { console.error(`Failed ${t.name}:`, e.message); }
    }

    console.log("\n✅ XLS DISTRIBUTION COMPLETED");
}
main();
