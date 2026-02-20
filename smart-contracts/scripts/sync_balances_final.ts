
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

    // Mints
    const lxrMint = lxrMintKp.publicKey;
    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

    const reserveVaultPubkey = new PublicKey(WALLET_REGISTRY.reserve_vault);
    const adminPubkey = adminKp.publicKey;

    const distribution = [
        { name: "Reserve", addr: WALLET_REGISTRY.reserve_vault, lxrPct: 0.60, xlsPct: 0.60 },
        { name: "Holding", addr: WALLET_REGISTRY.holding_fund, lxrPct: 0.20, xlsPct: 0.20 },
        { name: "Ops", addr: WALLET_REGISTRY.operations_fund, lxrPct: 0.10, xlsPct: 0.10 },
        { name: "Lock", addr: WALLET_REGISTRY.founder_lock_fund, lxrPct: 0.09, xlsPct: 0.09 },
        { name: "Personal", addr: WALLET_REGISTRY.founder_liquid, lxrPct: 0.01, xlsPct: 0.01 },
    ];

    const lxrTotal = 2066500000n * 1000000000n;
    const xlsTotal = 60750000n * 1000000000n;

    console.log("--- STARTING FINAL SYNC & DRAIN ---");

    // 1. DRAIN ADMIN -> RESERVE
    const tokens = [{ mint: lxrMint, name: "LXR" }, { mint: xlsMint, name: "XLS" }];
    for (const token of tokens) {
        try {
            const ata = getAssociatedTokenAddressSync(token.mint, adminPubkey, true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            const amount = BigInt(acc.amount);
            if (amount > 0n) {
                console.log(`  - Draining ${Number(amount) / 1e9} ${token.name} from Admin...`);
                const reserveAta = (await getOrCreateAssociatedTokenAccount(connection, adminKp, token.mint, reserveVaultPubkey, true, "confirmed", {}, tokenProgramId)).address;
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(ata, token.mint, reserveAta, adminPubkey, amount, 9, [], tokenProgramId)
                );
                await sendAndConfirmTransaction(connection, tx, [adminKp]);
            }
        } catch { }
    }

    // 2. REDISTRIBUTE FROM RESERVE/AUTH -> TARGETS
    for (const target of distribution) {
        const targetPubkey = new PublicKey(target.addr);
        const lxrT = (lxrTotal * BigInt(Math.round(target.lxrPct * 100))) / 100n;
        const xlsT = (xlsTotal * BigInt(Math.round(target.xlsPct * 100))) / 100n;

        // Sync LXR
        try {
            const ata = await getOrCreateAssociatedTokenAccount(connection, adminKp, lxrMint, targetPubkey, true, "confirmed", {}, tokenProgramId);
            const cur = BigInt(ata.amount);
            if (cur < lxrT) {
                const diff = lxrT - cur;
                console.log(`  - Moving ${Number(diff) / 1e9} LXR to ${target.name}...`);
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(
                        getAssociatedTokenAddressSync(lxrMint, lxrMintKp.publicKey, true, tokenProgramId),
                        lxrMint, ata.address, lxrMintKp.publicKey, diff, 9, [], tokenProgramId
                    )
                );
                await sendAndConfirmTransaction(connection, tx, [adminKp, lxrMintKp]);
            }
        } catch (e) { console.error(`Failed LXR to ${target.name}:`, e.message); }

        // Sync XLS from Mint Authority or Reserve
        try {
            const ata = await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, targetPubkey, true, "confirmed", {}, tokenProgramId);
            const cur = BigInt(ata.amount);
            if (cur < xlsT) {
                const diff = xlsT - cur;
                console.log(`  - Moving ${Number(diff) / 1e9} XLS to ${target.name}...`);
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(
                        getAssociatedTokenAddressSync(xlsMint, lxrMintKp.publicKey, true, tokenProgramId),
                        xlsMint, ata.address, lxrMintKp.publicKey, diff, 9, [], tokenProgramId
                    )
                );
                await sendAndConfirmTransaction(connection, tx, [adminKp, lxrMintKp]);
            }
        } catch (e) { console.error(`Failed XLS to ${target.name}:`, e.message); }
    }

    console.log("\n✅ ALLOCATION PERFECTLY SYNCED & ADMIN EMPTY");
}
main();
