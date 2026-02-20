
import * as anchor from "@coral-xyz/anchor";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram
} from "@solana/web3.js";
import * as fs from 'fs';
import { Program } from "@coral-xyz/anchor";

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const adminSecret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));

    const programId = new PublicKey("CihitmkdTdh48gvUZSjU7rZ8EARQksJNxspwnRu7ZhAp");
    const [globalConfig] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], programId);

    console.log("--- Resetting XLS Mint ---");

    // 1. Create New XLS Mint
    const newXlsMintKp = Keypair.generate();
    const newXlsMint = await createMint(
        connection, admin, admin.publicKey, admin.publicKey, 9,
        newXlsMintKp, { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
    );
    console.log("New XLS Mint Created:", newXlsMint.toBase58());
    fs.writeFileSync("./wallets/xls_mint.json", JSON.stringify(Array.from(newXlsMintKp.secretKey)));

    // 2. Prepare Vault
    const xlsVaultSupply = await getOrCreateAssociatedTokenAccount(
        connection, admin, newXlsMint, globalConfig, true, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
    );
    console.log("Vault ATA Prepared:", xlsVaultSupply.address.toBase58());

    // 3. Mint exactly 20.25M
    const amount = BigInt(20_250_000) * BigInt(10 ** 9);
    await mintTo(connection, admin, newXlsMint, xlsVaultSupply.address, admin, amount, [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID);
    console.log("Minted 20,250,000 XLS to Vault.");

    // 4. Update Program Config
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), {});
    const idl = JSON.parse(fs.readFileSync("../admin-dashboard/lib/idl.json", "utf8"));
    const program = new Program(idl as any, provider);

    const configAccount = await program.account.globalConfig.fetch(globalConfig);

    console.log("Updating Global Config on-chain...");
    await program.methods.upgradeConfig(
        configAccount.inflationInterval,
        configAccount.inflationRateBps
    ).accounts({
        admin: admin.publicKey,
        globalConfig: globalConfig,
        rwaVaultLxr: configAccount.rwaVaultLxr,
        xlsVaultSupply: xlsVaultSupply.address,
        lxrVaultRewards: configAccount.lxrVaultRewards,
        newXlsMint: newXlsMint,
        newLxrMint: configAccount.lxrMint, // Keep existing LXR
        systemProgram: SystemProgram.programId,
    } as any).rpc();

    console.log("Global Config Normalized with new XLS Mint.");

    // 5. Update Local IDL for Dashboard and Landing Page
    // (In a real scenario we'd update environment variables, but here we update the wallet registry and relevant files)
}

main().catch(console.error);
