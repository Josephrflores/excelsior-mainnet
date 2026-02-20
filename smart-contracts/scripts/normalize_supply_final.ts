
import * as anchor from "@coral-xyz/anchor";
import {
    getOrCreateAssociatedTokenAccount,
    createTransferCheckedInstruction,
    createBurnInstruction,
    mintTo,
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
import * as fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    if (!fs.existsSync("./wallets/admin.json")) throw new Error("Admin wallet not found!");
    const adminSecret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const lxrMint = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");

    const adminXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
    const adminLxrAta = await getOrCreateAssociatedTokenAccount(connection, admin, lxrMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    const targets = {
        xls: BigInt(20_250_000) * BigInt(Math.pow(10, 9)),
        lxr: BigInt(2_025_000_000) * BigInt(Math.pow(10, 9))
    };

    console.log("--- Consolidating ALL Master Wallets ---");
    const masterFiles = [
        "master_personal.json", "master_operations.json", "master_holding.json",
        "master_reserve.json", "master_market.json", "personal.json", "operations.json"
    ];

    for (const file of masterFiles) {
        const path = `./wallets/${file}`;
        if (!fs.existsSync(path)) continue;
        const secret = JSON.parse(fs.readFileSync(path, 'utf8'));
        const kp = Keypair.fromSecretKey(new Uint8Array(secret));
        console.log(`Checking ${file} (${kp.publicKey.toBase58()})...`);

        for (const mObj of [{ mint: xlsMint, adminAta: adminXlsAta, name: "XLS" }, { mint: lxrMint, adminAta: adminLxrAta, name: "LXR" }]) {
            try {
                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, mObj.mint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);
                if (bal.value.uiAmount && bal.value.uiAmount > 0) {
                    console.log(`  Transferring ${bal.value.uiAmount} ${mObj.name} to Admin...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(
                            ata.address, mObj.mint, mObj.adminAta.address, kp.publicKey,
                            BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID
                        )
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                }
            } catch (e) { }
        }
    }

    console.log("\n--- Equalizing Supplies ---");
    for (const mObj of [{ mint: xlsMint, ata: adminXlsAta, target: targets.xls, name: "XLS" }, { mint: lxrMint, ata: adminLxrAta, target: targets.lxr, name: "LXR" }]) {
        const mintInfo = await getMint(connection, mObj.mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const currentSupply = BigInt(mintInfo.supply);

        const balResp = await connection.getTokenAccountBalance(mObj.ata.address);
        const currentAdminBal = BigInt(balResp.value.amount);

        console.log(`${mObj.name} Supply is ${Number(currentSupply) / 1e9}, Target is ${Number(mObj.target) / 1e9}`);

        if (currentSupply > mObj.target) {
            const excess = currentSupply - mObj.target;
            const burnAmount = excess < currentAdminBal ? excess : currentAdminBal;
            if (burnAmount > 0n) {
                console.log(`  Burning ${Number(burnAmount) / 1e9} ${mObj.name}...`);
                const tx = new Transaction().add(createBurnInstruction(mObj.ata.address, mObj.mint, admin.publicKey, burnAmount, [], TOKEN_2022_PROGRAM_ID));
                await sendAndConfirmTransaction(connection, tx, [admin]);
            }
        }

        // Re-check supply and admin balance after potential burn
        const updatedMintInfo = await getMint(connection, mObj.mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const updatedSupply = BigInt(updatedMintInfo.supply);
        const updatedBalResp = await connection.getTokenAccountBalance(mObj.ata.address);
        const updatedAdminBal = BigInt(updatedBalResp.value.amount);

        if (updatedSupply < mObj.target) {
            const needed = mObj.target - updatedSupply;
            console.log(`  Minting ${Number(needed) / 1e9} ${mObj.name} to Admin to reach target...`);
            await mintTo(connection, admin, mObj.mint, mObj.ata.address, admin.publicKey, needed, [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID);
        } else if (updatedSupply > mObj.target) {
            console.log(`  Warning: ${mObj.name} supply still above target, but Admin balance exhausted or missing.`);
        }
    }

    const finalXlsMint = await getMint(connection, xlsMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const finalLxrMint = await getMint(connection, lxrMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const finalAdminXls = await connection.getTokenAccountBalance(adminXlsAta.address);
    const finalAdminLxr = await connection.getTokenAccountBalance(adminLxrAta.address);

    console.log("\n--- Normalization Complete ---");
    console.log(`Total XLS Supply: ${Number(finalXlsMint.supply) / 1e9}`);
    console.log(`Total LXR Supply: ${Number(finalLxrMint.supply) / 1e9}`);
    console.log(`Admin XLS Balance: ${finalAdminXls.value.uiAmount}`);
    console.log(`Admin LXR Balance: ${finalAdminLxr.value.uiAmount}`);
}

main().catch(console.error);
