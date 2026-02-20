
import * as anchor from "@coral-xyz/anchor";
import { Keypair, Transaction, sendAndConfirmTransaction, PublicKey, Connection } from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAccount,
    getMint
} from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    // 1. Configure
    // Use Admin wallet just for Paying fees (sol), but source of tokens is Reserve Vault
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    const adminWallet = provider.wallet as anchor.Wallet; // Payer of fees

    console.log("🚀 FUNDING PERSONAL WALLET (1% TOTAL SUPPLY)");
    console.log("---------------------------------------------------");

    // 2. Load Keys
    // Source: Reserve Vault (Currently keys/Roosevelt.json per user info)
    let sourceKp: Keypair;
    try {
        const secret = JSON.parse(fs.readFileSync("./wallets/distribution/Roosevelt.json", 'utf8'));
        sourceKp = Keypair.fromSecretKey(new Uint8Array(secret));
        console.log("Source (Reserve Vault/Roosevelt Original):", sourceKp.publicKey.toBase58());
    } catch (e) {
        console.error("❌ Could not load Source Wallet (Roosevelt.json).", e);
        process.exit(1);
    }

    // Destination: Roosevelt Personal (New)
    let destPubkey: PublicKey;
    try {
        // We can load from file or Registry. Let's use Registry for consistency, but ensure it matches file.
        const poolKey = new PublicKey(WALLET_REGISTRY.founder_liquid);
        destPubkey = poolKey;
        console.log("Destination (Personal):", destPubkey.toBase58());
    } catch (e) {
        console.error("❌ Invalid Destination Address in Registry.", e);
        process.exit(1);
    }

    // Mint
    let lxrMintKp: Keypair;
    try {
        lxrMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'))));
    } catch (e) {
        process.exit(1);
    }
    const lxrMint = lxrMintKp.publicKey;

    // Check Program
    const mintAccountInfo = await connection.getAccountInfo(lxrMint);
    const tokenProgramId = mintAccountInfo.owner;

    // 3. Calculate Amount
    // We need Total Supply. 
    const mintInfo = await getMint(connection, lxrMint, 'confirmed', tokenProgramId);
    const totalSupply = mintInfo.supply;
    const decimals = mintInfo.decimals;
    console.log("Total Supply:", totalSupply.toString());

    // 1% of Total Supply
    // Use BigInt math
    const percent1 = totalSupply / 100n;
    console.log("1% Amount:", percent1.toString());

    // 4. Check Source Balance
    const sourceAta = getAssociatedTokenAddressSync(lxrMint, sourceKp.publicKey, true, tokenProgramId);
    let sourceBalance = 0n;
    try {
        const acc = await getAccount(connection, sourceAta, 'confirmed', tokenProgramId);
        sourceBalance = acc.amount;
        console.log("Source Balance (Reserve):", sourceBalance.toString());
    } catch (e) {
        console.error("❌ Source ATA not found or empty.");
        process.exit(1);
    }

    if (sourceBalance < percent1) {
        console.error("❌ Insufficient funds in Reserve Vault!");
        return;
    }

    // 5. Create Dest ATA if needed
    const destAta = getAssociatedTokenAddressSync(lxrMint, destPubkey, true, tokenProgramId);
    let ataExists = false;
    try {
        await getAccount(connection, destAta, 'confirmed', tokenProgramId);
        ataExists = true;
        console.log("  - Dest ATA exists.");
    } catch (e) { }

    if (!ataExists) {
        console.log("  - Creating Dest ATA...");
        const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                adminWallet.publicKey, // Payer of rent
                destAta,
                destPubkey, // Owner
                lxrMint,
                tokenProgramId
            )
        );
        await sendAndConfirmTransaction(connection, tx, [adminWallet.payer], { commitment: 'confirmed' });
        console.log("  - ATA Created.");
    }

    // 6. Transfer
    console.log(`  - Transferring 1% (${percent1.toString()})...`);
    const txTransfer = new Transaction().add(
        createTransferCheckedInstruction(
            sourceAta,
            lxrMint,
            destAta,
            sourceKp.publicKey, // Owner of Source
            percent1,
            decimals,
            [],
            tokenProgramId
        )
    );

    try {
        // Signers: Payer (Admin) + SourceOwner (Roosevelt/Reserve)
        const sig = await sendAndConfirmTransaction(connection, txTransfer, [adminWallet.payer, sourceKp], { commitment: 'confirmed' });
        console.log("  ✅ Transfer Success! Sig:", sig);
    } catch (e) {
        console.error("  ❌ Transfer Failed:", e);
    }

    console.log("---------------------------------------------------");
}

main().catch(console.error);
