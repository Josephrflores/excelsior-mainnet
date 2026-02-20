
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint, createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
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

    const lxrTotal = 2066500000n * 1000000000n;
    const xlsTotal = 60750000n * 1000000000n;

    const distribution = [
        { name: "Reserve", addr: WALLET_REGISTRY.reserve_vault, lxrPct: 0.60, xlsPct: 0.60 },
        { name: "Holding", addr: WALLET_REGISTRY.holding_fund, lxrPct: 0.20, xlsPct: 0.20 },
        { name: "Ops", addr: WALLET_REGISTRY.operations_fund, lxrPct: 0.10, xlsPct: 0.10 },
        { name: "Lock", addr: WALLET_REGISTRY.founder_lock_fund, lxrPct: 0.09, xlsPct: 0.09 },
        { name: "Personal", addr: WALLET_REGISTRY.founder_liquid, lxrPct: 0.01, xlsPct: 0.01 },
    ];

    console.log("--- EXECUTING FINAL REDISTRIBUTION ---");

    for (const target of distribution) {
        const targetPubkey = new PublicKey(target.addr);
        const lxrT = (lxrTotal * BigInt(Math.round(target.lxrPct * 100))) / 100n;
        const xlsT = (xlsTotal * BigInt(Math.round(target.xlsPct * 100))) / 100n;

        // LXR Transfer from Mint Authority (where excess is)
        try {
            const ata = await getOrCreateAssociatedTokenAccount(connection, adminKp, lxrMint, targetPubkey, true, "confirmed", {}, tokenProgramId);
            const cur = BigInt(ata.amount);
            if (cur < lxrT) {
                const diff = lxrT - cur;
                console.log(`Moving ${Number(diff) / 1e9} LXR to ${target.name}...`);
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(
                        getAssociatedTokenAddressSync(lxrMint, lxrMintKp.publicKey, true, tokenProgramId),
                        lxrMint, ata.address, lxrMintKp.publicKey, diff, 9, [], tokenProgramId
                    )
                );
                await sendAndConfirmTransaction(connection, tx, [adminKp, lxrMintKp]);
            }
        } catch (e) { console.error(`Failed LXR to ${target.name}:`, e); }

        // XLS Transfer from Admin (where 20.25M is)
        try {
            const ata = await getOrCreateAssociatedTokenAccount(connection, adminKp, xlsMint, targetPubkey, true, "confirmed", {}, tokenProgramId);
            const cur = BigInt(ata.amount);
            if (cur < xlsT) {
                const diff = xlsT - cur;
                console.log(`Moving ${Number(diff) / 1e9} XLS to ${target.name}...`);
                const tx = new Transaction().add(
                    createTransferCheckedInstruction(
                        getAssociatedTokenAddressSync(xlsMint, adminKp.publicKey, true, tokenProgramId),
                        xlsMint, ata.address, adminKp.publicKey, diff, 9, [], tokenProgramId
                    )
                );
                await sendAndConfirmTransaction(connection, tx, [adminKp]);
            }
        } catch (e) { console.error(`Failed XLS to ${target.name}:`, e); }
    }
    console.log("\n✅ ALLOCATION SYNCED");
}
main();
