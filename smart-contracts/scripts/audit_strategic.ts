
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    // Mints
    const lxrMintKp = JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'));
    const lxrMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(lxrMintKp)).publicKey;
    const xlsMint = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

    const targets = {
        "Reserve (60%)": WALLET_REGISTRY.reserve_vault,
        "Holding (20%)": WALLET_REGISTRY.holding_fund,
        "Operations (10%)": WALLET_REGISTRY.operations_fund,
        "Founder Lock (9%)": WALLET_REGISTRY.founder_lock_fund,
        "Roosevelt Liquid (1%)": WALLET_REGISTRY.founder_liquid,
        "Admin (0%)": "7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"
    };

    console.log("--- STRATEGIC 5-WALLET AUDIT ---");

    for (const [name, addr] of Object.entries(targets)) {
        console.log(`\nWallet: ${name} (${addr})`);

        // LXR
        try {
            const ata = getAssociatedTokenAddressSync(lxrMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            console.log(`  LXR: ${Number(acc.amount) / 1e9}`);
        } catch { console.log(`  LXR: 0`); }

        // XLS
        try {
            const ata = getAssociatedTokenAddressSync(xlsMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            console.log(`  XLS: ${Number(acc.amount) / 1e9}`);
        } catch { console.log(`  XLS: 0`); }
    }
}
main();
