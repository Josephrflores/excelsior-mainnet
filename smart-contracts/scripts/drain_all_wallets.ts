
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
    if (!fs.existsSync(dir)) return allFiles;
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
    const adminPath = "./wallets/admin.json";
    if (!fs.existsSync(adminPath)) throw new Error("Admin wallet not found!");
    const adminSecret = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const lxrMint = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");

    console.log("Admin Address:", admin.publicKey.toBase58());

    const adminXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
    const adminLxrAta = await getOrCreateAssociatedTokenAccount(connection, admin, lxrMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    const walletFiles = getFiles("./wallets");
    console.log(`--- Mass Clearing: Setting all secondary wallets to ZERO ---`);

    for (const file of walletFiles) {
        try {
            const secret = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (!Array.isArray(secret) || secret.length !== 64) continue;
            const kp = Keypair.fromSecretKey(new Uint8Array(secret));

            if (kp.publicKey.equals(admin.publicKey)) continue;

            // XLS Drainage
            try {
                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);
                if (bal.value.amount !== "0") {
                    console.log(`  Draining XLS from ${path.basename(file)} (${kp.publicKey.toBase58()})...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(ata.address, xlsMint, adminXlsAta.address, kp.publicKey, BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID)
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                }
            } catch (e) { }

            // LXR Drainage
            try {
                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, lxrMint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);
                if (bal.value.amount !== "0") {
                    console.log(`  Draining LXR from ${path.basename(file)} (${kp.publicKey.toBase58()})...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(ata.address, lxrMint, adminLxrAta.address, kp.publicKey, BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID)
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                }
            } catch (e) { }

        } catch (e) { }
    }

    console.log("\n--- Consolidation Complete. All wallets should be at zero. ---");

    const fXls = await connection.getTokenAccountBalance(adminXlsAta.address);
    const fLxr = await connection.getTokenAccountBalance(adminLxrAta.address);
    console.log(`Admin Final XLS: ${fXls.value.uiAmount}`);
    console.log(`Admin Final LXR: ${fLxr.value.uiAmount}`);
}

main().catch(console.error);
