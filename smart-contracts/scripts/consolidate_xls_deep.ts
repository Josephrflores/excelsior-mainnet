
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

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    if (!fs.existsSync("./wallets/admin.json")) throw new Error("Admin wallet not found!");
    const adminSecret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const adminXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    const targetXls = BigInt(20_250_000) * BigInt(10 ** 9);

    const walletDirs = ["./wallets", "./wallets/distribution"];
    let consolidatedCount = 0;

    console.log("--- Deep Consolidation XLS ---");

    for (const dir of walletDirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                const secret = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (!Array.isArray(secret)) continue;
                const kp = Keypair.fromSecretKey(new Uint8Array(secret));

                if (kp.publicKey.equals(admin.publicKey)) continue;

                const ata = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, kp.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata.address);

                if (bal.value.uiAmount && bal.value.uiAmount > 0) {
                    console.log(`  Consolidating ${bal.value.uiAmount} XLS from ${file} (${kp.publicKey.toBase58()})...`);
                    const tx = new Transaction().add(
                        createTransferCheckedInstruction(
                            ata.address, xlsMint, adminXlsAta.address, kp.publicKey,
                            BigInt(bal.value.amount), 9, [], TOKEN_2022_PROGRAM_ID
                        )
                    );
                    await sendAndConfirmTransaction(connection, tx, [admin, kp]);
                    consolidatedCount++;
                }
            } catch (e) { }
        }
    }

    console.log(`\nConsolidation phase complete. Wallets processed with balance: ${consolidatedCount}`);

    const mintInfo = await getMint(connection, xlsMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const currentSupply = BigInt(mintInfo.supply);
    console.log(`Current Total Supply: ${Number(currentSupply) / 1e9} XLS`);
    console.log(`Target Total Supply: ${Number(targetXls) / 1e9} XLS`);

    if (currentSupply > targetXls) {
        const excess = currentSupply - targetXls;
        const adminBalResp = await connection.getTokenAccountBalance(adminXlsAta.address);
        const adminBal = BigInt(adminBalResp.value.amount);

        console.log(`Excess Supply: ${Number(excess) / 1e9} XLS`);
        console.log(`Admin Balance: ${Number(adminBal) / 1e9} XLS`);

        const burnAmount = excess < adminBal ? excess : adminBal;
        if (burnAmount > 0n) {
            console.log(`Burning ${Number(burnAmount) / 1e9} XLS...`);
            const tx = new Transaction().add(
                createBurnInstruction(adminXlsAta.address, xlsMint, admin.publicKey, burnAmount, [], TOKEN_2022_PROGRAM_ID)
            );
            await sendAndConfirmTransaction(connection, tx, [admin]);
            console.log("Burn successful.");
        }
    }

    const finalMint = await getMint(connection, xlsMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`Final Total Supply: ${Number(finalMint.supply) / 1e9} XLS`);
}

main().catch(console.error);
