
import * as anchor from "@coral-xyz/anchor";
import {
    getOrCreateAssociatedTokenAccount,
    createTransferCheckedInstruction,
    createBurnInstruction,
    TOKEN_2022_PROGRAM_ID,
    getMint
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    if (!fs.existsSync("./wallets/admin.json")) throw new Error("Admin wallet not found!");
    const adminSecret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const lxrMint = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
    const programId = new PublicKey("CihitmkdTdh48gvUZSjU7rZ8EARQksJNxspwnRu7ZhAp");
    const [globalConfig] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], programId);

    const adminXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
    const adminLxrAta = await getOrCreateAssociatedTokenAccount(connection, admin, lxrMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    const targets = {
        xls: 20_250_000 * 10 ** 9,
        lxr: 2_025_000_000 * 10 ** 9
    };

    console.log("--- Consolidating Master Wallets ---");
    const masterWallets = [
        { name: "personal", path: "./wallets/personal.json" },
        { name: "operations", path: "./wallets/operations.json" },
        { name: "holding", path: "./wallets/holding.json" },
        { name: "reserve", path: "./wallets/reserve.json" }
    ];

    for (const w of masterWallets) {
        if (!fs.existsSync(w.path)) continue;
        const kp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(w.path, 'utf8'))));
        console.log(`Checking ${w.name} (${kp.publicKey.toBase58()})...`);

        for (const mintObj of [{ mint: xlsMint, adminAta: adminXlsAta, name: "XLS" }, { mint: lxrMint, adminAta: adminLxrAta, name: "LXR" }]) {
            try {
                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, mintObj.mint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);
                if (bal.value.uiAmount && bal.value.uiAmount > 0) {
                    console.log(`  Transferring ${bal.value.uiAmount} ${mintObj.name} to Admin...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(
                            ata.address, mintObj.mint, mintObj.adminAta.address, kp.publicKey,
                            BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID
                        )
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                }
            } catch (e) {
                console.log(`  No ${mintObj.name} account or balance for ${w.name}`);
            }
        }
    }

    console.log("\n--- Consolidating PDA Vaults (Admin must be authority) ---");
    // Since we initialized with Admin as auth, we should be able to move funds if they were minted to PDAs
    // However, if they are locked in program vaults, we might need a program instruction to move them.
    // Let's check GlobalConfig ATAs directly.
    const vaultAtas = [
        { name: "XLS_VaultSupply", owner: globalConfig, mint: xlsMint, adminAta: adminXlsAta },
        { name: "RWA_VaultLxr", owner: globalConfig, mint: lxrMint, adminAta: adminLxrAta }
    ];

    for (const v of vaultAtas) {
        try {
            const ata = await getOrCreateAssociatedTokenAccount(connection, admin, v.mint, v.owner, true, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
            const bal = await connection.getTokenAccountBalance(ata.address);
            if (bal.value.uiAmount && bal.value.uiAmount > 0) {
                console.log(`  Vault ${v.name} has ${bal.value.uiAmount}. Manual drain required if not Admin controlled.`);
                // Note: PDA accounts can only be signed by the program. 
                // We'll skip manual drain of PDAs in this script and focus on burning from Admin.
            }
        } catch (e) { }
    }

    console.log("\n--- Normalizing Total Supply (Burning Excess) ---");
    for (const mintObj of [{ mint: xlsMint, ata: adminXlsAta, target: targets.xls, name: "XLS" }, { mint: lxrMint, ata: adminLxrAta, target: targets.lxr, name: "LXR" }]) {
        const mintInfo = await getMint(connection, mintObj.mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const currentSupply = Number(mintInfo.supply);
        const excess = currentSupply - mintObj.target;

        if (excess > 0) {
            console.log(`${mintObj.name} Supply: ${currentSupply / 10 ** 9} | Target: ${mintObj.target / 10 ** 9} | Excess: ${excess / 10 ** 9}`);
            const adminBal = await connection.getTokenAccountBalance(mintObj.ata.address);
            const burnAmount = Math.min(excess, Number(adminBal.value.amount));

            if (burnAmount > 0) {
                console.log(`  Burning ${burnAmount / 10 ** 9} ${mintObj.name} from Admin...`);
                const tx = new Transaction().add(
                    createBurnInstruction(mintObj.ata.address, mintObj.mint, admin.publicKey, BigInt(burnAmount), [], TOKEN_2022_PROGRAM_ID)
                );
                await sendAndConfirmTransaction(connection, tx, [admin]);
                console.log(`  Burn complete.`);
            }
        } else {
            console.log(`${mintObj.name} Supply is already at or below target.`);
        }
    }

    console.log("\n--- Final Balances ---");
    const finalXls = await connection.getTokenAccountBalance(adminXlsAta.address);
    const finalLxr = await connection.getTokenAccountBalance(adminLxrAta.address);
    console.log(`Admin XLS: ${finalXls.value.uiAmount}`);
    console.log(`Admin LXR: ${finalLxr.value.uiAmount}`);

    const xlsMintInfo = await getMint(connection, xlsMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const lxrMintInfo = await getMint(connection, lxrMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`Total XLS Supply: ${Number(xlsMintInfo.supply) / 10 ** 9}`);
    console.log(`Total LXR Supply: ${Number(lxrMintInfo.supply) / 10 ** 9}`);
}

main().catch(console.error);
