
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount, createMintToInstruction, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    // Load Keys
    const adminKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'))));
    const lockFundKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/founder_vault.json", 'utf8'))));

    const lxrMint = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

    const reservePubkey = new PublicKey(WALLET_REGISTRY.reserve_vault);
    const holdingPubkey = new PublicKey(WALLET_REGISTRY.holding_fund);
    const opsPubkey = new PublicKey(WALLET_REGISTRY.operations_fund);
    const lockPubkey = new PublicKey(WALLET_REGISTRY.founder_lock_fund);

    console.log("--- FINAL SUPPLY CORRECTION: MINT & REBALANCE (ADMIN AUTH) ---");

    // Helper to get/create ATA
    const getAta = async (mint: PublicKey, owner: PublicKey) => {
        return (await getOrCreateAssociatedTokenAccount(connection, adminKp, mint, owner, true, "confirmed", {}, tokenProgramId)).address;
    };

    // 1. MINT LXR MISSING
    const lxrTargets = [
        { name: "Reserve", pub: reservePubkey, amount: 45565000n * 1000000000n },
        { name: "Holding", pub: holdingPubkey, amount: 8300000n * 1000000000n },
        { name: "Ops", pub: opsPubkey, amount: 4150000n * 1000000000n }
    ];

    for (const t of lxrTargets) {
        console.log(`  - Minting ${Number(t.amount) / 1e9} LXR to ${t.name}...`);
        const ata = await getAta(lxrMint, t.pub);
        const tx = new Transaction().add(createMintToInstruction(lxrMint, ata, adminKp.publicKey, t.amount, [], tokenProgramId));
        await sendAndConfirmTransaction(connection, tx, [adminKp]);
    }

    // 2. MINT XLS MISSING
    const xlsTargets = [
        { name: "Reserve", pub: reservePubkey, amount: 35032500n * 1000000000n },
        { name: "Lock", pub: lockPubkey, amount: 5467500n * 1000000000n }
    ];

    for (const t of xlsTargets) {
        console.log(`  - Minting ${Number(t.amount) / 1e9} XLS to ${t.name}...`);
        const ata = await getAta(xlsMint, t.pub);
        const tx = new Transaction().add(createMintToInstruction(xlsMint, ata, adminKp.publicKey, t.amount, [], tokenProgramId));
        await sendAndConfirmTransaction(connection, tx, [adminKp]);
    }

    // 3. REBALANCE LXR EXCESS (Lock Fund 9.8% -> 9%)
    const lxrExcess = 16515000n * 1000000000n;
    console.log(`  - Moving ${Number(lxrExcess) / 1e9} LXR from Lock to Reserve...`);
    const lockLxrAta = getAssociatedTokenAddressSync(lxrMint, lockPubkey, true, tokenProgramId);
    const reserveLxrAta = await getAta(lxrMint, reservePubkey);
    const txMove = new Transaction().add(
        createTransferCheckedInstruction(lockLxrAta, lxrMint, reserveLxrAta, lockPubkey, lxrExcess, 9, [], tokenProgramId)
    );
    await sendAndConfirmTransaction(connection, txMove, [adminKp, lockFundKp]);

    console.log("\n✅ ALL VAULTS PERFECTLY SYNCED (60/20/10/9/1)");
}
main();
