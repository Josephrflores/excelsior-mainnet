
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
import * as fs from 'fs';
import * as path from 'path';

function getFiles(dir: string, allFiles: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else if (file.endsWith(".json")) {
            allFiles.push(name);
        }
    }
    return allFiles;
}

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    if (!fs.existsSync("./wallets/admin.json")) throw new Error("Admin wallet not found!");
    const adminSecret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const lxrMint = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");

    const adminXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
    const adminLxrAta = await getOrCreateAssociatedTokenAccount(connection, admin, lxrMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    const targetXls = BigInt(20_250_000) * BigInt(10 ** 9);
    const targetLxr = BigInt(2_025_000_000) * BigInt(10 ** 9);

    const files = getFiles("./wallets");

    console.log(`--- Clean up: Draining ${files.length} wallets ---`);

    for (const file of files) {
        try {
            const secret = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (!Array.isArray(secret)) continue;
            const kp = Keypair.fromSecretKey(new Uint8Array(secret));

            if (kp.publicKey.equals(admin.publicKey)) continue;

            // XLS
            try {
                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);
                if (bal.value.amount !== "0") {
                    console.log(`  Draining XLS from ${file}...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(ata.address, xlsMint, adminXlsAta.address, kp.publicKey, BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID)
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                }
            } catch (e) { }

            // LXR
            try {
                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, lxrMint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);
                if (bal.value.amount !== "0") {
                    console.log(`  Draining LXR from ${file}...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(ata.address, lxrMint, adminLxrAta.address, kp.publicKey, BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID)
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                }
            } catch (e) { }
        } catch (e) { }
    }

    // NORMALIZE
    console.log("\n--- Normalizing Supply ---");

    const xlsInfo = await getMint(connection, xlsMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    if (BigInt(xlsInfo.supply) > targetXls) {
        const excess = BigInt(xlsInfo.supply) - targetXls;
        const burnAmount = excess; // Try to burn all excess from Admin
        console.log(`  Burning XLS Excess: ${Number(burnAmount) / 1e9}...`);
        const tx = new Transaction().add(createBurnInstruction(adminXlsAta.address, xlsMint, admin.publicKey, burnAmount, [], TOKEN_2022_PROGRAM_ID));
        await sendAndConfirmTransaction(connection, tx, [admin]);
    }

    const lxrInfo = await getMint(connection, lxrMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    if (BigInt(lxrInfo.supply) > targetLxr) {
        const excess = BigInt(lxrInfo.supply) - targetLxr;
        console.log(`  Burning LXR Excess: ${Number(excess) / 1e9}...`);
        const tx = new Transaction().add(createBurnInstruction(adminLxrAta.address, lxrMint, admin.publicKey, excess, [], TOKEN_2022_PROGRAM_ID));
        await sendAndConfirmTransaction(connection, tx, [admin]);
    }

    console.log("\nFinal Supply Check:");
    const fXls = await getMint(connection, xlsMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const fLxr = await getMint(connection, lxrMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`XLS Total Supply: ${Number(fXls.supply) / 1e9}`);
    console.log(`LXR Total Supply: ${Number(fLxr.supply) / 1e9}`);
}

main().catch(console.error);
