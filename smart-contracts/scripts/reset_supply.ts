
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
    const xlsMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/xls_mint.json", 'utf8'))));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const authPubkey = lxrMintKp.publicKey;
    const authXlsAta = (await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, authPubkey, true, "confirmed", {}, tokenProgramId)).address;

    const allWallets = [
        { name: "Admin", kp: adminKp },
        { name: "Reserve", addr: WALLET_REGISTRY.reserve_vault },
        { name: "Holding", addr: WALLET_REGISTRY.holding_fund },
        { name: "Ops", addr: WALLET_REGISTRY.operations_fund },
        { name: "Lock", addr: WALLET_REGISTRY.founder_lock_fund },
        { name: "Personal", addr: WALLET_REGISTRY.founder_liquid },
    ];

    console.log("--- PHASE 1: DRAINING ALL XLS TO AUTHORITY ---");
    for (const w of allWallets) {
        const pub = "kp" in w ? w.kp.publicKey : new PublicKey(w.addr);
        try {
            const ata = getAssociatedTokenAddressSync(xlsMint, pub, true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            const bal = BigInt(acc.amount);
            if (bal > 0n) {
                console.log(`  - Draining ${Number(bal) / 1e9} XLS from ${w.name}...`);
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(ata, xlsMint, authXlsAta, pub, bal, 9, [], tokenProgramId)
                );
                // We need to sign with the wallet being drained. 
                // Admin we have. Others we need to see. 
                // Wait, most were sent from Admin, but if we don't have private keys, we can't 'drain'.
                // I will only drain what I have keys for (Admin). 
                // For the rest, I will use the Authority to 'Burn and Mint' or just pull if I can.
            }
        } catch { }
    }

    console.log("\n--- PHASE 2: REDISTRIBUTING FROM AUTHORITY ---");
    // Implementation of precise split...
}
main();
