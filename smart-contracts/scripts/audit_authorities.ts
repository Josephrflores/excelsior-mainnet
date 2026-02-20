
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    // Mints
    const lxrMintKp = JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'));
    const lxrMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(lxrMintKp)).publicKey;
    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

    // Authorities (From previously identified keys)
    const authorities = {
        "LXR Mint Authority": "7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth",
        "XLS Mint Authority": "GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki" // XLS mint is its own auth? Or auth is the key used to create it.
    };

    console.log("--- MINT AUTHORITY ATA AUDIT ---");

    for (const [name, addr] of Object.entries(authorities)) {
        console.log(`\nAuthority: ${name} (${addr})`);

        // LXR
        try {
            const ata = getAssociatedTokenAddressSync(lxrMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            console.log(`  LXR ATA Balance: ${Number(acc.amount) / 1e9}`);
        } catch { console.log(`  LXR ATA Balance: 0 / No ATA`); }

        // XLS
        try {
            const ata = getAssociatedTokenAddressSync(xlsMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            console.log(`  XLS ATA Balance: ${Number(acc.amount) / 1e9}`);
        } catch { console.log(`  XLS ATA Balance: 0 / No ATA`); }
    }
}
main();
