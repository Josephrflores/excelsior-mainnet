
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

    const lxrMint = lxrMintKp.publicKey;
    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

    const lxr9Percent = 185985000n * 1000000000n; // 9% of 2.0665B
    const xls9Percent = 5467500n * 1000000000n;   // 9% of 60.75M
    const lockFundPubkey = new PublicKey(WALLET_REGISTRY.founder_lock_fund); // FC6Z...

    console.log("--- FINAL LOCK FUND ALIGNMENT ---");

    // LXR Sync for Lock Fund
    try {
        const ata = (await getOrCreateAssociatedTokenAccount(connection, adminKp, lxrMint, lockFundPubkey, true, "confirmed", {}, tokenProgramId));
        const cur = BigInt(ata.amount);
        if (cur < lxr9Percent) {
            const diff = lxr9Percent - cur;
            console.log(`  - Moving ${Number(diff) / 1e9} LXR to Lock Fund...`);
            const tx = new Transaction().add(
                createTransferCheckedInstruction(
                    getAssociatedTokenAddressSync(lxrMint, lxrMintKp.publicKey, true, tokenProgramId),
                    lxrMint, ata.address, lxrMintKp.publicKey, diff, 9, [], tokenProgramId
                )
            );
            await sendAndConfirmTransaction(connection, tx, [adminKp, lxrMintKp]);
        } else { console.log("  - LXR already >= 9%."); }
    } catch (e) { console.error("LXR Error:", e.message); }

    // XLS Sync for Lock Fund (Using Authority as Source)
    try {
        const ata = (await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, lockFundPubkey, true, "confirmed", {}, tokenProgramId));
        const cur = BigInt(ata.amount);
        if (cur < xls9Percent) {
            const diff = xls9Percent - cur;
            console.log(`  - Moving ${Number(diff) / 1e9} XLS to Lock Fund...`);
            const tx = new Transaction().add(
                createTransferCheckedInstruction(
                    getAssociatedTokenAddressSync(xlsMint, lxrMintKp.publicKey, true, tokenProgramId),
                    xlsMint, ata.address, lxrMintKp.publicKey, diff, 9, [], tokenProgramId
                )
            );
            await sendAndConfirmTransaction(connection, tx, [adminKp, lxrMintKp]);
        } else { console.log("  - XLS already >= 9%."); }
    } catch (e) { console.error("XLS Error:", e.message); }

    console.log("\n✅ LOCK FUND PERFECTLY SYNCED");
}
main();
