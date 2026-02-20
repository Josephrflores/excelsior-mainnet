
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";
import { WALLET_REGISTRY } from "./wallet_registry";
import fs from 'fs';

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;

    // Load Mint (XLS)
    let xlsMintKp = JSON.parse(fs.readFileSync("./wallets/xls_mint.json", 'utf8'));
    const kp = anchor.web3.Keypair.fromSecretKey(new Uint8Array(xlsMintKp));
    const mint = kp.publicKey;

    const tokenProgramId = (await connection.getAccountInfo(mint))!.owner;

    const wallets = {
        "Reserve (60% Target)": WALLET_REGISTRY.reserve_vault,
        "Holding (20% Target)": WALLET_REGISTRY.holding_fund,
        "Ops (10% Target)": WALLET_REGISTRY.operations_fund,
        "Lock (9% Target)": WALLET_REGISTRY.founder_lock_fund,
        "Personal (1% Target)": WALLET_REGISTRY.founder_liquid
    };

    console.log("--- CURRENT XLS BALANCES ---");
    const mintInfo = await getMint(connection, mint, 'confirmed', tokenProgramId);
    console.log("Total Supply:", Number(mintInfo.supply) / 1e9);

    for (const [name, addr] of Object.entries(wallets)) {
        try {
            const ata = getAssociatedTokenAddressSync(mint, new PublicKey(addr), true, tokenProgramId);
            const acc = await getAccount(connection, ata, 'confirmed', tokenProgramId);
            const amount = Number(acc.amount) / 1e9;
            const pct = (Number(acc.amount) * 100) / Number(mintInfo.supply);
            console.log(`${name}: ${amount.toLocaleString()} (${pct.toFixed(2)}%)`);
        } catch (e) {
            console.log(`${name}: 0 (No ATA)`);
        }
    }
}

main();
