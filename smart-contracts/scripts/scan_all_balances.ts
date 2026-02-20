
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;

    // Load Dashboard JSON
    const walletAddresses = JSON.parse(fs.readFileSync("../admin-dashboard/lib/wallet-addresses.json", 'utf8'));

    // Load Mints
    const lxrMintKp = JSON.parse(fs.readFileSync("./wallets/lxr_mint.json", 'utf8'));
    const lxrMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(lxrMintKp)).publicKey;

    const xlsMintKp = JSON.parse(fs.readFileSync("./wallets/xls_mint.json", 'utf8'));
    const xlsMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(xlsMintKp)).publicKey;

    // Load Admin
    const adminKp = JSON.parse(fs.readFileSync("./wallets/admin.json", 'utf8'));
    const admin = anchor.web3.Keypair.fromSecretKey(new Uint8Array(adminKp)).publicKey;

    const tokenProgramId = (await connection.getAccountInfo(lxrMint))!.owner;

    const allPotentialWallets = new Set<string>();

    // 1. From Registry
    Object.values(WALLET_REGISTRY).forEach(v => allPotentialWallets.add(v));

    // 2. From Dashboard JSON
    walletAddresses.forEach(w => allPotentialWallets.add(w.address));

    // 3. Admin itself
    allPotentialWallets.add(admin.toBase58());

    console.log(`--- SCANNING ${allPotentialWallets.size} WALLETS ---`);

    for (const addr of allPotentialWallets) {
        let lxr = 0;
        let xls = 0;

        try {
            const ata = getAssociatedTokenAddressSync(lxrMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            lxr = Number(acc.amount);
        } catch { }

        try {
            const ata = getAssociatedTokenAddressSync(xlsMint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            xls = Number(acc.amount);
        } catch { }

        if (lxr > 0 || xls > 0) {
            console.log(`Wallet: ${addr}`);
            if (lxr > 0) console.log(`  LXR: ${lxr / 1e9}`);
            if (xls > 0) console.log(`  XLS: ${xls / 1e9}`);
        }
    }
}

main();
