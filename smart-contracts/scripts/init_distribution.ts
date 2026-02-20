
import * as anchor from "@coral-xyz/anchor";
import {
    createMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    SystemProgram,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import * as fs from 'fs';
import { Program } from "@coral-xyz/anchor";
import { WALLET_REGISTRY } from "./wallet_registry";

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

async function main() {
    let provider: anchor.AnchorProvider;
    if (process.env.ANCHOR_PROVIDER_URL) {
        provider = anchor.AnchorProvider.env();
    } else {
        console.log("Env vars missing, using fallback (Devnet)...");
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        if (!fs.existsSync("./wallets/admin.json")) throw new Error("Admin wallet not found!");
        const secret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
        const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(secret)));
        provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    }
    anchor.setProvider(provider);
    const connection = provider.connection;
    const admin = (provider.wallet as anchor.Wallet).payer;

    console.log("Admin:", admin.publicKey.toBase58());

    ensureDir("./wallets");
    const founderPubkey = new PublicKey(WALLET_REGISTRY.founder_personal_1);
    const rwaWalletPubkey = new PublicKey(WALLET_REGISTRY.genesis_authority);

    if (!fs.existsSync("./wallets/xls_mint.json") || !fs.existsSync("./wallets/lxr_mint.json")) {
        console.error("Mints not found. Run create_tokens.ts first.");
        return;
    }
    const xlsMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/xls_mint.json", 'utf8'))));
    const lxrMintKp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'))));

    const xlsMint = xlsMintKp.publicKey;
    const lxrMint = lxrMintKp.publicKey;

    const idl = JSON.parse(fs.readFileSync("./target/idl/excelsior.json", "utf8"));
    const programId = new PublicKey("CihitmkdTdh48gvUZSjU7rZ8EARQksJNxspwnRu7ZhAp");
    const program = new Program(idl, provider);

    const [globalConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_config")],
        programId
    );

    // Associated Token Accounts for PDAs (needed for initialization)
    const xlsVaultSupply = await getOrCreateAssociatedTokenAccount(
        connection, admin, xlsMint, globalConfig, true, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
    );
    const rwaVaultLxr = await getOrCreateAssociatedTokenAccount(
        connection, admin, lxrMint, globalConfig, true, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
    );
    const lxrVaultRewards = await getOrCreateAssociatedTokenAccount(
        connection, admin, lxrMint, globalConfig, true, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
    );

    try {
        const configAccount = await (program.account as any).globalConfig.fetchNullable(globalConfig);
        if (!configAccount) {
            console.log("Initializing Global Config...");
            await program.methods
                .initialize({ feeBasisPoints: 300 })
                .accounts({
                    admin: admin.publicKey,
                    globalConfig: globalConfig,
                    rwaWallet: rwaWalletPubkey,
                    founderWallet: founderPubkey,
                    xlsMint: xlsMint,
                    lxrMint: lxrMint,
                    rwaVaultLxr: rwaVaultLxr.address,
                    xlsVaultSupply: xlsVaultSupply.address,
                    lxrVaultRewards: lxrVaultRewards.address,
                    systemProgram: SystemProgram.programId,
                } as any)
                .signers([admin])
                .rpc();
            console.log("Global Config Initialized:", globalConfig.toBase58());
        } else {
            console.log("Global Config already initialized.");
        }
    } catch (e) {
        console.error("Error initializing config:", e);
    }

    // New logic: Keep all tokens in Admin instead of vaults for manual distribution from dashboard
    try {
        const adminXls = await getOrCreateAssociatedTokenAccount(
            connection, admin, xlsMint, admin.publicKey, false, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
        );

        const adminXlsBal = (await connection.getTokenAccountBalance(adminXls.address)).value.uiAmount;
        if (adminXlsBal === null || adminXlsBal < 1) {
            console.log("Minting XLS to Admin (for manual distribution later)...");
            await mintTo(
                connection,
                admin,
                xlsMint,
                adminXls.address,
                admin.publicKey,
                20_250_000 * 10 ** 9,
                [],
                { commitment: 'finalized' },
                TOKEN_2022_PROGRAM_ID
            );
            console.log("Minted XLS to Admin.");
        } else {
            console.log("Admin already has XLS.");
        }

        const adminLxr = await getOrCreateAssociatedTokenAccount(
            connection, admin, lxrMint, admin.publicKey, false, 'finalized', { commitment: 'finalized' }, TOKEN_2022_PROGRAM_ID
        );

        const adminLxrBal = (await connection.getTokenAccountBalance(adminLxr.address)).value.uiAmount;
        if (adminLxrBal === null || adminLxrBal < 1000) {
            console.log("Minting LXR to Admin (for manual distribution later)...");
            await mintTo(
                connection,
                admin,
                lxrMint,
                adminLxr.address,
                admin.publicKey,
                2_025_000_000 * 10 ** 9,
                [],
                { commitment: 'finalized' },
                TOKEN_2022_PROGRAM_ID
            );
            console.log("Minted LXR to Admin.");
        } else {
            console.log("Admin already has LXR.");
        }

    } catch (e) {
        console.error("Error minting to admin:", e);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
