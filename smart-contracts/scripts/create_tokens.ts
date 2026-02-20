
import * as anchor from "@coral-xyz/anchor";
import {
    createMint,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    ExtensionType,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
    mintTo,
    getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey
} from "@solana/web3.js";
import fs from 'fs';

// Helper to ensure directory exists
const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

async function main() {
    // 1. Setup
    // 1. Setup Connection and Provider
    let provider: anchor.AnchorProvider;

    if (process.env.ANCHOR_PROVIDER_URL) {
        provider = anchor.AnchorProvider.env();
    } else {
        // Fallback for standalone execution
        console.log("Env vars missing, using fallback (Devnet)...");
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");

        // Load Wallet
        if (!fs.existsSync("./wallets/admin.json")) {
            ensureDir("./wallets");
            const kp = Keypair.generate();
            fs.writeFileSync("./wallets/admin.json", JSON.stringify(Array.from(kp.secretKey)));
            console.log("Created ./wallets/admin.json");
        }
        const secret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
        const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(secret)));

        provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    }

    anchor.setProvider(provider);
    const connection = provider.connection;
    const wallet = provider.wallet as anchor.Wallet; // Admin

    ensureDir("./wallets");

    // Helper to load or create keypair
    const getOrGenKeypair = (name: string): Keypair => {
        const path = `./wallets/${name}.json`;
        if (fs.existsSync(path)) {
            const secret = JSON.parse(fs.readFileSync(path, 'utf8'));
            return Keypair.fromSecretKey(new Uint8Array(secret));
        } else {
            const kp = Keypair.generate();
            fs.writeFileSync(path, JSON.stringify(Array.from(kp.secretKey)));
            console.log(`Generated new keypair for ${name}: ${kp.publicKey.toBase58()}`);
            return kp;
        }
    }

    const admin = wallet.payer; // Use provider wallet (Admin)
    console.log("Admin User:", admin.publicKey.toBase58());

    // Load Mint Keypairs (persistent)
    const xlsMintKp = getOrGenKeypair("xls_mint");
    const lxrMintKp = getOrGenKeypair("lxr_mint");

    const DECIMALS = 9;

    const USER_ADMIN = new PublicKey("HSVNZpogeqKejdWrpm3uVxjopYUj63MCfMKd1rRPVe4X");

    // --- Create Excelsior (XLS) ---
    // Standard Token-2022. Authority = Admin.
    try {
        // Check if exists
        const info = await connection.getAccountInfo(xlsMintKp.publicKey);
        if (info) {
            console.log("XLS Mint already exists:", xlsMintKp.publicKey.toBase58());
        } else {
            console.log("Creating XLS Mint...");
            await createMint(
                connection,
                admin,
                USER_ADMIN, // Mint Auth
                USER_ADMIN, // Freeze Auth (Retained)
                DECIMALS,
                xlsMintKp,
                { commitment: 'finalized' },
                TOKEN_2022_PROGRAM_ID
            );
            console.log("XLS Mint Created:", xlsMintKp.publicKey.toBase58());
        }
    } catch (e) {
        console.error("Error creating XLS:", e);
    }

    // --- Create Luxor (LXR) ---
    // Token-2022 with Transfer Fee. Authority = Admin.
    try {
        const info = await connection.getAccountInfo(lxrMintKp.publicKey);
        if (info) {
            console.log("LXR Mint already exists:", lxrMintKp.publicKey.toBase58());
        } else {
            console.log("Creating LXR Mint with 3% Transfer Fee...");

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
                // Initialize Transfer Fee Config
                createInitializeTransferFeeConfigInstruction(
                    lxrMintKp.publicKey,
                    USER_ADMIN, // TransferFeeConfigAuthority (Retained)
                    USER_ADMIN, // WithdrawWithheldAuthority (Retained)
                    300,             // 3% (300 basis points)
                    BigInt(100_000 * 10 ** 9), // Max Fee (Cap) -> Keeping it high
                    TOKEN_2022_PROGRAM_ID
                ),
                createInitializeMintInstruction(
                    lxrMintKp.publicKey,
                    DECIMALS,
                    USER_ADMIN, // Mint Auth (Retained)
                    USER_ADMIN, // Freeze Auth (Retained)
                    TOKEN_2022_PROGRAM_ID
                )
            );

            const sig = await sendAndConfirmTransaction(connection, transaction, [admin, lxrMintKp]);
            console.log("LXR Mint Created. Sig:", sig);

            // Fund USER with Initial Supply (e.g., 2 Billion)
            console.log("Minting Initial Supply (2B LXR) to User Admin...");
            const userAta = await getOrCreateAssociatedTokenAccount(
                connection, admin, lxrMintKp.publicKey, USER_ADMIN, false, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
            );
            await mintTo(
                connection, admin, lxrMintKp.publicKey, userAta.address, USER_ADMIN,
                2_000_000_000 * (10 ** DECIMALS), // 2 Billion
                [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
            );
            console.log("User funded with 2B LXR.");
        }

        // Fund USER with Initial Supply (Check loop or force)
        // We do this outside the "if/else" so it runs if mint exists too.
        console.log("Checking User LXR Balance...");
        const userAta = await getOrCreateAssociatedTokenAccount(
            connection, admin, lxrMintKp.publicKey, USER_ADMIN, false, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
        );

        try {
            const balance = await connection.getTokenAccountBalance(userAta.address);
            if (balance.value.uiAmount < 100_000_000) { // If less than 100M, top up
                console.log(`Balance low (${balance.value.uiAmount}). Minting Initial Supply (2B LXR) to User Admin...`);
                await mintTo(
                    connection, admin, lxrMintKp.publicKey, userAta.address, USER_ADMIN,
                    2_000_000_000 * (10 ** DECIMALS), // 2 Billion
                    [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
                );
                console.log("User funded with 2B LXR.");
            } else {
                console.log("User already has sufficient LXR:", balance.value.uiAmount);
            }
        } catch (e) {
            // If account is empty/new, getTokenAccountBalance might throw or return 0
            console.log("Error checking balance (likely empty), minting fresh...");
            await mintTo(
                connection, admin, lxrMintKp.publicKey, userAta.address, USER_ADMIN,
                2_000_000_000 * (10 ** DECIMALS), // 2 Billion
                [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
            );
        }

    } catch (e) {
        console.error("Error creating/funding LXR:", e);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
