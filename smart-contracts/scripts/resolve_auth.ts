
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";
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

    const lxrInfo = await getMint(connection, lxrMint);
    const xlsInfo = await getMint(connection, xlsMint);

    console.log("LXR Mint Authority:", lxrInfo.mintAuthority?.toBase58());
    console.log("XLS Mint Authority:", xlsInfo.mintAuthority?.toBase58());

    const auth = lxrInfo.mintAuthority!;

    const lxrAta = getAssociatedTokenAddressSync(lxrMint, auth, true, lxrInfo.owner);
    const xlsAta = getAssociatedTokenAddressSync(xlsMint, auth, true, xlsInfo.owner);

    console.log(`\nAuthority ATA (LXR): ${lxrAta.toBase58()}`);
    try {
        const acc = await getAccount(connection, lxrAta);
        console.log(`  Balance: ${Number(acc.amount) / 1e9}`);
    } catch { console.log("  No LXR ATA found for authority"); }

    console.log(`\nAuthority ATA (XLS): ${xlsAta.toBase58()}`);
    try {
        const acc = await getAccount(connection, xlsAta);
        console.log(`  Balance: ${Number(acc.amount) / 1e9}`);
    } catch { console.log("  No XLS ATA found for authority"); }
}

main();
