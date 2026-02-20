
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Excelsior } from "../target/types/excelsior";
import {
    PublicKey,
    SystemProgram,
    Keypair,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAccount,
    getMint,
    createSetTransferFeeInstruction
} from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    // 1. Setup Environment
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Excelsior as Program<Excelsior>;
    const connection = provider.connection;
    const adminWallet = provider.wallet as anchor.Wallet;

    console.log("🚀 STARTING MASTER EXECUTION PLAN");
    console.log("---------------------------------------------------");
    console.log("Admin / Supply Holder:", adminWallet.publicKey.toBase58());

    // 2. Load Keys
    let lxrMintKp: Keypair;
    try {
        lxrMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'))));
    } catch (e) {
        console.error("❌ Could not load 'lxr_mint.json'. Cannot update SPL Token Fees without Mint Keypair.");
        process.exit(1);
    }
    const lxrMint = lxrMintKp.publicKey;
    console.log("LXR Mint:", lxrMint.toBase58());

    // Check Mint Program Owner
    const mintAccountInfo = await connection.getAccountInfo(lxrMint);
    if (!mintAccountInfo) {
        console.error("❌ LXR Mint not found on chain.");
        return;
    }
    const tokenProgramId = mintAccountInfo.owner;
    console.log("Token Program ID:", tokenProgramId.toBase58());

    // ----------------------------------------------------------------
    // STEP 1: ZERO FEES (User Request: "No cobres el fee del 1% aun")
    // ----------------------------------------------------------------
    console.log("\n[1/2] 🛡️  Disabling Fees (0%)...");

    if (tokenProgramId.equals(TOKEN_2022_PROGRAM_ID)) {
        // A. Disable SPL Token 2022 Transfer Fee
        try {
            const transaction = new Transaction().add(
                createSetTransferFeeInstruction(
                    lxrMint,
                    adminWallet.publicKey, // Authority
                    [],
                    0, // 0 Basis Points
                    BigInt(100_000 * 10 ** 9), // Max Fee Cap
                    TOKEN_2022_PROGRAM_ID
                )
            );
            const sig = await sendAndConfirmTransaction(connection, transaction, [adminWallet.payer], { commitment: 'confirmed' });
            console.log("✅ SPL Token Fee set to 0%. Sig:", sig);
        } catch (e) {
            console.error("⚠️  Failed to set SPL Token Fee:", e);
        }
    } else {
        console.log("ℹ️  LXR Mint is NOT Token 2022. Skipping SPL Fee Update.");
    }

    // B. Disable Smart Contract Fee (Global Config)
    try {
        const [globalConfigPubkey] = PublicKey.findProgramAddressSync(
            [Buffer.from("global_config")],
            program.programId
        );

        // Find 'updateFee' method in IDL
        const tx = await program.methods
            .updateFee(0) // 0 BPS
            .accounts({
                admin: adminWallet.publicKey,
                globalConfig: globalConfigPubkey,
            } as any)
            .rpc();

        console.log("✅ Smart Contract GlobalConfig Fee set to 0%. Tx:", tx);
    } catch (e) {
        console.error("⚠️  Failed to update GlobalConfig Fee (Instruction might not exist or auth failed):", e);
    }

    // ----------------------------------------------------------------
    // STEP 2: DISTRIBUTE SUPPLY (60/20/10/10)
    // ----------------------------------------------------------------
    console.log("\n[2/2] 💰 Distributing Supply...");

    // Get Admin ATA
    const adminAta = getAssociatedTokenAddressSync(lxrMint, adminWallet.publicKey, false, tokenProgramId);

    // Check Balance
    let adminBalance;
    try {
        const account = await getAccount(connection, adminAta, 'confirmed', tokenProgramId);
        adminBalance = account.amount;
        console.log(`Admin Balance: ${adminBalance.toString()} LXR (Raw Units)`);
    } catch (e) {
        console.error("❌ Admin has no LXR Token Account or 0 balance.", e);
        return;
    }

    // Get Decimals
    const mintInfo = await getMint(connection, lxrMint, 'confirmed', tokenProgramId);
    const decimals = mintInfo.decimals;
    console.log(`Decimals: ${decimals}`);

    // Define Plan
    const rawTargets = [
        { name: "Reserve Vault (60%)", key: WALLET_REGISTRY.reserve_vault, percent: 0.60 },
        { name: "Holding Fund (20%)", key: WALLET_REGISTRY.holding_fund, percent: 0.20 },
        { name: "Operations Fund (10%)", key: WALLET_REGISTRY.operations_fund, percent: 0.10 },
        { name: "Founder Lock (10%)", key: WALLET_REGISTRY.founder_lock_fund, percent: 0.10 },
    ];

    const totalSupply = BigInt(adminBalance.toString()); // Assuming Admin holds 100% currently available

    for (const target of rawTargets) {
        console.log(`\nProcessing: ${target.name}...`);
        console.log(`  Key: '${target.key}'`);

        if (!target.key) {
            console.error(`  ❌ Key is undefined for ${target.name}`);
            continue;
        }

        let pubkey: PublicKey;
        try {
            pubkey = new PublicKey(target.key);
        } catch (e) {
            console.error(`  ❌ Invalid Public Key for ${target.name}: '${target.key}'`);
            continue;
        }

        // 1. Get/Create Destination ATA
        const destAta = getAssociatedTokenAddressSync(lxrMint, pubkey, true, tokenProgramId);
        let ataExists = false;
        try {
            await getAccount(connection, destAta, 'confirmed', tokenProgramId);
            ataExists = true;
            console.log("  - ATA exists.");
        } catch (e) {
            // AccountDoesNotExist
        }

        if (!ataExists) {
            console.log("  - Creating ATA for " + pubkey.toBase58());
            try {
                const tx = new Transaction().add(
                    createAssociatedTokenAccountInstruction(
                        adminWallet.publicKey, // Payer
                        destAta,
                        pubkey, // Owner
                        lxrMint,
                        tokenProgramId
                    )
                );
                await sendAndConfirmTransaction(connection, tx, [adminWallet.payer], { commitment: 'confirmed' });
                console.log("  - ATA Created.");
            } catch (e) {
                console.error("  ❌ Failed to create ATA:", e);
                continue;
            }
        }

        // 2. Transfer
        const amount = (totalSupply * BigInt(Math.floor(target.percent * 100))) / 100n;
        console.log(`  - Transferring ${amount.toString()} units...`);

        const txTransfer = new Transaction().add(
            createTransferCheckedInstruction(
                adminAta,
                lxrMint,
                destAta,
                adminWallet.publicKey,
                amount,
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
    }

    console.log("\n---------------------------------------------------");
    console.log("🎉 MASTER PLAN EXECUTION COMPLETE.");
}

main().catch(console.error);
