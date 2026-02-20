
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;

    // Load Mints
    const lxrMintKp = JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'));
    const lxrMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(lxrMintKp)).publicKey;

    const xlsMintKp = JSON.parse(fs.readFileSync("./wallets/xls_mint.json", 'utf8'));
    const xlsMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(xlsMintKp)).publicKey;

    // Load Admin
    const adminKp = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = anchor.web3.Keypair.fromSecretKey(new Uint8Array(adminKp)).publicKey;

    const tokenProgramId = (await connection.getAccountInfo(lxrMint))!.owner;

    const scanWallets = {
        "Admin": admin.toBase58(),
        "Supply Holder": WALLET_REGISTRY.supply_holder,
        "Genesis Authority": WALLET_REGISTRY.genesis_authority
    };

    console.log("--- SCANNING FOR REMAINING TOKENS ---");

    for (const [name, addr] of Object.entries(scanWallets)) {
        console.log(`\nWallet: ${name} (${addr})`);

        // Check LXR
        try {
            const ata = getAssociatedTokenAddressSync(lxrMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            console.log(`  LXR Balance: ${Number(acc.amount) / 1e9}`);
        } catch (e) {
            console.log(`  LXR Balance: 0`);
        }

        // Check XLS
        try {
            const ata = getAssociatedTokenAddressSync(xlsMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            console.log(`  XLS Balance: ${Number(acc.amount) / 1e9}`);
        } catch (e) {
            console.log(`  XLS Balance: 0`);
        }
    }
}

main();
