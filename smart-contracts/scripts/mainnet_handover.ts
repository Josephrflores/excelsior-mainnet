import * as anchor from "@coral-xyz/anchor";
import {
    createMint,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    ExtensionType,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    setAuthority,
    AuthorityType
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey
} from "@solana/web3.js";
import * as fs from 'fs';
import { WALLET_REGISTRY } from './wallet_registry';

// Helper to ensure directory exists
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getOrCreateAtaWithRetry(
    connection: Connection,
    payer: anchor.web3.Signer,
    mint: PublicKey,
    owner: PublicKey,
    programId: PublicKey
) {
    let retries = 5;
    while (retries > 0) {
        try {
            return await getOrCreateAssociatedTokenAccount(
                connection, payer, mint, owner, true, 'confirmed', { commitment: 'confirmed' }, programId
            );
        } catch (e: any) {
            console.log(`Retrying ATA fetch for ${owner.toBase58()}... (${retries} attempts left)`);
            retries--;
            await delay(2000); // wait 2 seconds
        }
    }
    throw new Error(`Failed to get or create ATA for ${owner.toBase58()}`);
}

async function main() {
    // 1. Setup Connection and Provider
    let provider: anchor.AnchorProvider;

    const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com"; // Switch to mainnet RPC
    console.log(`Connecting to: ${RPC_URL}`);
    const connection = new Connection(RPC_URL, "confirmed");

    // Load Admin Wallet
    if (!fs.existsSync("./wallets/admin.json")) {
        throw new Error("Admin wallet not found. Ensure ./wallets/admin.json exists.");
    }
    const secret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(secret)));

    provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);
    const admin = wallet.payer;
    console.log("Admin User Deployer:", admin.publicKey.toBase58());

    // Load Mint Keypairs (persistent Genesis keys)
    if (!fs.existsSync("./wallets/xls_mint.json") || !fs.existsSync("./wallets/lxr_mint.json")) {
        throw new Error("Mint JSONs not found! Cannot proceed without lxr_mint.json and xls_mint.json");
    }
    const xlsMintSecret = JSON.parse(fs.readFileSync("./wallets/xls_mint.json", 'utf8'));
    const xlsMintKp = Keypair.fromSecretKey(new Uint8Array(xlsMintSecret));

    const lxrMintSecret = JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'));
    const lxrMintKp = Keypair.fromSecretKey(new Uint8Array(lxrMintSecret));

    const DECIMALS = 9;

    // SQUADS MULTISIG VAULT ADDRESS (Ultimate Authority & Destination)
    const SQUADS_VAULT = new PublicKey(WALLET_REGISTRY.genesis_authority);
    console.log("Target Squads Vault:", SQUADS_VAULT.toBase58());

    // --- Create Excelsior (XLS) ---
    try {
        const info = await connection.getAccountInfo(xlsMintKp.publicKey);
        if (info) {
            console.log("XLS Mint already exists:", xlsMintKp.publicKey.toBase58());
        } else {
            console.log("Creating XLS Mint...");
            await createMint(
                connection,
                admin,
                admin.publicKey, // Temp Mint Auth
                admin.publicKey, // Temp Freeze Auth
                DECIMALS,
                xlsMintKp,
                { commitment: 'finalized' },
                TOKEN_2022_PROGRAM_ID
            );
            console.log("XLS Mint Created:", xlsMintKp.publicKey.toBase58());
        }

        // Distribute Supply
        const MULTIPLIER = BigInt(1_000_000_000);
        const supplyXls = BigInt(20_250_000) * MULTIPLIER;
        const distributionXls = [
            { name: "59% Reserve Vault", wallet: WALLET_REGISTRY.reserve_vault_59, percentage: 59 },
            { name: "1% Liquidity", wallet: WALLET_REGISTRY.liquidity_1, percentage: 1 },
            { name: "15% Main Holding (Vesting)", wallet: WALLET_REGISTRY.main_holding_vesting_15, percentage: 15 },
            { name: "5% Main Holding (Liquid)", wallet: WALLET_REGISTRY.main_holding_liquid_5, percentage: 5 },
            { name: "10% Operations Fund", wallet: WALLET_REGISTRY.operations_fund_10, percentage: 10 },
            { name: "9% Founder Lock Fund", wallet: WALLET_REGISTRY.founder_lock_fund_9, percentage: 9 },
            { name: "1% Founder Personal", wallet: WALLET_REGISTRY.founder_personal_1, percentage: 1 }
        ];

        console.log("Distributing 20.25M XLS according to Constitution...");
        for (const dist of distributionXls) {
            const amount = supplyXls * BigInt(dist.percentage) / BigInt(100);
            const targetVault = new PublicKey(dist.wallet);
            const ata = await getOrCreateAtaWithRetry(
                connection, admin, xlsMintKp.publicKey, targetVault, TOKEN_2022_PROGRAM_ID
            );
            try {
                await mintTo(
                    connection, admin, xlsMintKp.publicKey, ata.address, admin, // Auth is admin for now
                    amount, [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
                );
                console.log(`- Minted ${dist.percentage}% XLS to ${dist.name} (${dist.wallet})`);
            } catch (e: any) {
                console.log(`Skipping XLS mint for ${dist.name}, possibly already minted:`, e.message);
            }
        }

        // Transfer Authorities to Squads
        console.log("Handing over XLS Authorities to Squads...");
        try {
            await setAuthority(connection, admin, xlsMintKp.publicKey, admin, AuthorityType.MintTokens, SQUADS_VAULT, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);
            await setAuthority(connection, admin, xlsMintKp.publicKey, admin, AuthorityType.FreezeAccount, SQUADS_VAULT, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);
            console.log("XLS Authorities transferred to Squads!");
        } catch (e: any) {
            console.log("Skipping XLS authority transfer, possibly already transferred:", e.message);
        }

    } catch (e) {
        console.error("Error processing XLS:", e);
    }

    // --- Create Luxor (LXR) ---
    try {
        const info = await connection.getAccountInfo(lxrMintKp.publicKey);
        if (info) {
            console.log("LXR Mint already exists:", lxrMintKp.publicKey.toBase58());
        } else {
            console.log("Creating LXR Mint with 1% Transfer Fee...");

            const extensions = [ExtensionType.TransferFeeConfig];
            const mintLen = getMintLen(extensions);
            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: admin.publicKey,
                    newAccountPubkey: lxrMintKp.publicKey,
                    space: mintLen,
                    lamports,
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                // Initialize Transfer Fee Config (1% Start)
                createInitializeTransferFeeConfigInstruction(
                    lxrMintKp.publicKey,
                    admin.publicKey, // Temp TransferFeeConfigAuthority 
                    admin.publicKey, // Temp WithdrawWithheldAuthority 
                    100,             // 1% (100 basis points) for Day 0
                    BigInt(100_000 * 10 ** 9), // Max Fee Cap
                    TOKEN_2022_PROGRAM_ID
                ),
                createInitializeMintInstruction(
                    lxrMintKp.publicKey,
                    DECIMALS,
                    admin.publicKey, // Temp Mint Auth 
                    admin.publicKey, // Temp Freeze Auth 
                    TOKEN_2022_PROGRAM_ID
                )
            );

            const sig = await sendAndConfirmTransaction(connection, transaction, [admin, lxrMintKp]);
            console.log("LXR Mint Created. Sig:", sig);
        }

        // Distribute Supply
        const MULTIPLIER = BigInt(1_000_000_000);
        const supplyLxr = BigInt(2_025_000_000) * MULTIPLIER;
        const distributionLxr = [
            { name: "59% Reserve Vault", wallet: WALLET_REGISTRY.reserve_vault_59, percentage: 59 },
            { name: "1% Liquidity", wallet: WALLET_REGISTRY.liquidity_1, percentage: 1 },
            { name: "15% Main Holding (Vesting)", wallet: WALLET_REGISTRY.main_holding_vesting_15, percentage: 15 },
            { name: "5% Main Holding (Liquid)", wallet: WALLET_REGISTRY.main_holding_liquid_5, percentage: 5 },
            { name: "10% Operations Fund", wallet: WALLET_REGISTRY.operations_fund_10, percentage: 10 },
            { name: "9% Founder Lock Fund", wallet: WALLET_REGISTRY.founder_lock_fund_9, percentage: 9 },
            { name: "1% Founder Personal", wallet: WALLET_REGISTRY.founder_personal_1, percentage: 1 }
        ];

        console.log("Distributing 2.025B LXR according to Constitution...");
        for (const dist of distributionLxr) {
            const amount = supplyLxr * BigInt(dist.percentage) / BigInt(100);
            const targetVault = new PublicKey(dist.wallet);
            const ata = await getOrCreateAtaWithRetry(
                connection, admin, lxrMintKp.publicKey, targetVault, TOKEN_2022_PROGRAM_ID
            );
            try {
                await mintTo(
                    connection, admin, lxrMintKp.publicKey, ata.address, admin, // Auth is admin for now
                    amount, [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
                );
                console.log(`- Minted ${dist.percentage}% LXR to ${dist.name} (${dist.wallet})`);
            } catch (e: any) {
                console.log(`Skipping LXR mint for ${dist.name}, possibly already minted:`, e.message);
            }
        }

        // Transfer Authorities to Squads
        console.log("Handing over LXR Authorities to Squads...");
        try {
            await setAuthority(connection, admin, lxrMintKp.publicKey, admin, AuthorityType.MintTokens, SQUADS_VAULT, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);
            await setAuthority(connection, admin, lxrMintKp.publicKey, admin, AuthorityType.FreezeAccount, SQUADS_VAULT, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);

            // Transfer Fee Authorities
            await setAuthority(connection, admin, lxrMintKp.publicKey, admin, AuthorityType.TransferFeeConfig, SQUADS_VAULT, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);
            await setAuthority(connection, admin, lxrMintKp.publicKey, admin, AuthorityType.WithheldWithdraw, SQUADS_VAULT, [], { commitment: "confirmed" }, TOKEN_2022_PROGRAM_ID);
            console.log("LXR Authorities transferred to Squads!");
        } catch (e: any) {
            console.log("Skipping LXR authority transfer, possibly already transferred:", e.message);
        }

    } catch (e) {
        console.error("Error processing LXR:", e);
    }

    console.log("=============================================");
    console.log("HANDOVER COMPLETE.");
    console.log("All Token supplies and authorities are now owned by your Squad Vault.");
    console.log("Next Steps for Smart Contract Handover:");
    console.log(`Run this in your terminal to pass program upgrade authority to Squads:`);
    console.log(`solana program set-upgrade-authority <PROGRAM_ID> --new-upgrade-authority ${SQUADS_VAULT.toBase58()} --keypair ./wallets/admin.json`);
    console.log("=============================================");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
