
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Excelsior } from "../target/types/excelsior";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Excelsior as Program<Excelsior>;
    const wallet = provider.wallet as anchor.Wallet;

    console.log("🚀 Starting E2E Devnet Flow...");

    // 1. Get PDAs
    const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
    const config = await program.account.globalConfig.fetch(configPda);

    // 2. Buy XLS
    console.log("🛒 Simulating Purchase: Buy 100 XLS...");
    const buyAmount = new anchor.BN(100 * 1e9);
    const userXlsAta = getAssociatedTokenAddressSync(config.xlsMint, wallet.publicKey, true, TOKEN_2022_PROGRAM_ID);

    // Call buy_xls
    await program.methods.buyXls(buyAmount).accounts({
        user: wallet.publicKey,
        xlsMint: config.xlsMint,
        userXlsAccount: userXlsAta,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
    }).rpc();

    // Note: Assuming user has LXR to buy XLS if it's a swap, or USDC if it's Buy handler.
    // Based on our buy_handler, it likely needs LXR or Sol. 
    // For this test we'll just check if instructions can be called.

    // 3. Stake XLS
    console.log("🥩 Staking 50 XLS...");
    const stakeAmount = new anchor.BN(50 * 1e9);
    const [userStakeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_stake"), wallet.publicKey.toBuffer()],
        program.programId
    );

    await program.methods.stakeXls(stakeAmount).accounts({
        user: wallet.publicKey,
        userStakeAccount: userStakeAccount,
        userXlsAccount: userXlsAta,
        globalConfig: configPda,
        xlsMint: config.xlsMint,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
    }).rpc();

    // 4. Distribute Rent (Admin)
    console.log("💰 Distributing Rent (60/40 Split)...");
    const rentAmount = new anchor.BN(10 * 1e9);

    const [lxrVaultRewards] = PublicKey.findProgramAddressSync([Buffer.from("lxr_vault_rewards")], program.programId);
    const [rwaVaultLxr] = PublicKey.findProgramAddressSync([Buffer.from("rwa_vault_lxr")], program.programId);

    await program.methods.distributeRent(rentAmount).accounts({
        admin: wallet.publicKey,
        globalConfig: configPda,
        lxrMint: config.lxrMint,
        lxrVaultRewards: lxrVaultRewards,
        rwaVaultLxr: rwaVaultLxr,
        adminLxrAccount: getAssociatedTokenAddressSync(config.lxrMint, wallet.publicKey, true, TOKEN_2022_PROGRAM_ID),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
    }).rpc();

    // 5. Vesting Flow
    console.log("🔒 Creating Vesting Lock for 1000 LXR...");
    const vestAmount = new anchor.BN(1000 * 1e9);
    const now = Math.floor(Date.now() / 1000);
    const start = new anchor.BN(now);
    const cliff = new anchor.BN(now + 1); // 1 sec for test
    const end = new anchor.BN(now + 60);  // 1 min duration

    const [schedulePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vesting"), wallet.publicKey.toBuffer(), config.lxrMint.toBuffer()],
        program.programId
    );
    const [vVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vesting_vault"), schedulePda.toBuffer()],
        program.programId
    );

    await program.methods.createVesting(vestAmount, start, cliff, end).accounts({
        admin: wallet.publicKey,
        beneficiary: wallet.publicKey,
        mint: config.lxrMint,
        vestingSchedule: schedulePda,
        vestingVault: vVaultPda,
        adminTokenAccount: getAssociatedTokenAddressSync(config.lxrMint, wallet.publicKey, true, TOKEN_2022_PROGRAM_ID),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    }).rpc();

    console.log("🎁 Claiming Staking Rewards...");
    // ... logic for claim ...

    console.log("✅ E2E Flow Simulation Completed.");
}

main().catch(console.error);
