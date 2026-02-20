
import * as anchor from "@coral-xyz/anchor";
import {
    getOrCreateAssociatedTokenAccount,
    TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
} from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    if (!fs.existsSync("./wallets/admin.json")) throw new Error("Admin wallet not found!");
    const adminSecret = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = Keypair.fromSecretKey(new Uint8Array(adminSecret));
    const wallet = new anchor.Wallet(admin);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
    const programId = new PublicKey("CihitmkdTdh48gvUZSjU7rZ8EARQksJNxspwnRu7ZhAp");
    const idl = JSON.parse(fs.readFileSync("./target/idl/excelsior.json", "utf8"));
    const program = new Program(idl, provider);

    const [globalConfig] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], programId);

    const adminXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, admin.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
    const vaultXlsAta = await getOrCreateAssociatedTokenAccount(connection, admin, xlsMint, globalConfig, true, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    const bal = await connection.getTokenAccountBalance(vaultXlsAta.address);
    if (bal.value.uiAmount && bal.value.uiAmount > 0) {
        console.log(`Vault has ${bal.value.uiAmount} XLS. Extracting to Admin...`);
        // We need an instruction that can move funds from the PDA vault.
        // Looking at the IDL, distribute_rent is for LXR. 
        // We might not have a direct 'withdraw' for XLS in this program version.
        // Let's check if the admin can just sign for the move (if it's a simple ATA).
        // Since it is owned by GlobalConfig PDA, only the program can sign.
    } else {
        console.log("Vault is empty or missing.");
    }
}
main().catch(console.error);
