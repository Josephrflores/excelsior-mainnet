import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Excelsior } from "../target/types/excelsior";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { WALLET_REGISTRY } from "./wallet_registry";

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Excelsior as Program<Excelsior>;

    console.log("Applying Wallet Configuration to Smart Contract...");

    // 1. Update Distribution Wallets On-Chain
    try {
        const [globalConfigPubkey] = PublicKey.findProgramAddressSync(
            [Buffer.from("global_config")],
            program.programId
        );

        const tx = await program.methods
            .updateDistributionWallets()
            .accounts({
                admin: provider.wallet.publicKey,
                globalConfig: globalConfigPubkey,
                // Rent Wallets
                waterWallet: new PublicKey(WALLET_REGISTRY.water_fund),
                dataLatencyWallet: new PublicKey(WALLET_REGISTRY.data_fund),
                energyGridWallet: new PublicKey(WALLET_REGISTRY.energy_fund),
                chipsWallet: new PublicKey(WALLET_REGISTRY.chips_fund),
                talentWallet: new PublicKey(WALLET_REGISTRY.talent_fund),
                communityYieldWallet: new PublicKey(WALLET_REGISTRY.community_fund),
                operationsWallet: new PublicKey(WALLET_REGISTRY.ops_growth_fund),
                holdingWallet: new PublicKey(WALLET_REGISTRY.holding_distribution),
                founderWallet: new PublicKey(WALLET_REGISTRY.founder_lock_fund),
                reinvestmentWallet: new PublicKey(WALLET_REGISTRY.reinvestment_fund),
                // Fee Wallets
                feeExcelsiorVault: new PublicKey(WALLET_REGISTRY.fees_excelsior_vault),
                feeStableReserve: new PublicKey(WALLET_REGISTRY.fees_stablecoin_reserve),
                feeFounderWallet: new PublicKey(WALLET_REGISTRY.fees_founder_living),

                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();

        console.log("✅ Configuration Updated! Tx:", tx);
    } catch (e) {
        console.error("❌ Failed to update config (Maybe instruction not found in IDL yet?):", e);
    }

    // 2. Print Supply Distribution Plan
    console.log("\n💰 SUPPLY DISTRIBUTION PLAN (Execute Manually or via Script):");
    console.log("---------------------------------------------------------");
    console.log(`Source (Admin/Supply): ${WALLET_REGISTRY.supply_holder}`);

    const distributions = [
        { name: "Reserve Vault (60%)", address: WALLET_REGISTRY.reserve_vault, pct: 0.60 },
        { name: "Holding Fund (20%)", address: WALLET_REGISTRY.holding_fund, pct: 0.20 },
        { name: "Operations Fund (10%)", address: WALLET_REGISTRY.operations_fund, pct: 0.10 },
        { name: "Founder Lock (10%)", address: WALLET_REGISTRY.founder_lock_fund, pct: 0.10 },
    ];

    distributions.forEach(d => {
        console.log(`- Transfer ${d.pct * 100}% to ${d.name}: ${d.address}`);
    });
    console.log("---------------------------------------------------------");
    console.log("Verify these keys match your 'wallet_registry.ts' before execution.");
}

main().catch(console.error);
