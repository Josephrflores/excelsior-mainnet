
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, Transaction, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, getAccount, getMint } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    const adminWallet = provider.wallet as anchor.Wallet;

    console.log("🚀 FINISHING FOUNDER TRANSFER (10%)");
    console.log("---------------------------------------------------");

    // Load Mint
    let lxrMintKp: Keypair;
    try {
        lxrMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'))));
    } catch (e) {
        console.error("❌ Could not load 'lxr_mint.json'.");
        process.exit(1);
    }
    const lxrMint = lxrMintKp.publicKey;

    // Check Mint Program Owner
    const mintAccountInfo = await connection.getAccountInfo(lxrMint);
    const tokenProgramId = mintAccountInfo.owner;

    // Get Admin ATA
    const adminAta = getAssociatedTokenAddressSync(lxrMint, adminWallet.publicKey, false, tokenProgramId);

    // Check Balance
    let adminBalance;
    try {
        const account = await getAccount(connection, adminAta, 'confirmed', tokenProgramId);
        adminBalance = account.amount;
        console.log(`Admin Current Balance: ${adminBalance.toString()} LXR`);
    } catch (e) {
        console.error("❌ Admin has no LXR Token Account or 0 balance.", e);
        return;
    }

    if (adminBalance === 0n) {
        console.log("⚠️ Admin has 0 balance. Nothing to transfer.");
        return;
    }

    // Target: Founder Lock
    const targetKey = new PublicKey(WALLET_REGISTRY.founder_lock_fund);
    console.log("Target: Founder Lock Fund");
    console.log("Key:", targetKey.toBase58());

    // 1. Get/Create Destination ATA
    const destAta = getAssociatedTokenAddressSync(lxrMint, targetKey, true, tokenProgramId);
    let ataExists = false;
    try {
        await getAccount(connection, destAta, 'confirmed', tokenProgramId);
        ataExists = true;
        console.log("  - ATA exists.");
    } catch (e) { }

    if (!ataExists) {
        console.log("  - Creating ATA...");
        const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                adminWallet.publicKey,
                destAta,
                targetKey,
                lxrMint,
                tokenProgramId
            )
        );
        await sendAndConfirmTransaction(connection, tx, [adminWallet.payer], { commitment: 'confirmed' });
        console.log("  - ATA Created.");
    }

    // 2. Transfer ENTIRE remaining balance
    const mintInfo = await getMint(connection, lxrMint, 'confirmed', tokenProgramId);
    const decimals = mintInfo.decimals;

    console.log(`  - Transferring ${adminBalance.toString()} units...`);

    const txTransfer = new Transaction().add(
        createTransferCheckedInstruction(
            adminAta,
            lxrMint,
            destAta,
            adminWallet.publicKey,
            adminBalance, // Send ALL
            decimals,
            [],
            tokenProgramId
        )
    );

    try {
        const sig = await sendAndConfirmTransaction(connection, txTransfer, [adminWallet.payer], { commitment: 'confirmed' });
        console.log("  ✅ Transfer Success! Sig:", sig);
    } catch (e) {
        console.error("  ❌ Transfer Failed:", e);
    }

    console.log("---------------------------------------------------");
}

main().catch(console.error);
