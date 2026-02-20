
import React, { useState, useEffect } from "react";
import { Database, Coins, PieChart, ChevronLeft, Lock } from "lucide-react";
import Link from 'next/link';
import { AnimatePresence } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useProtocol, cn, ModuleGuard } from "../shared/index";
import idl from "@/lib/idl/excelsior.json";

import { StakingDashboard } from "./StakingDashboard";
import { XLSStaking } from "./XLSStaking";
import { LXRYield } from "./LXRYield";
import { Governance } from "./Governance";

const programId = new PublicKey("CihitmkdTdh48gvUZSjU7rZ8EARQksJNxspwnRu7ZhAp");

export const StakingModule = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { status, setStatus, message, setMessage, getProgram, config, moduleFlags } = useProtocol();
    const [activeTab, setActiveTab] = useState<"dashboard" | "staking" | "yield" | "governance">("dashboard");

    // State
    const [stakingStats, setStakingStats] = useState({
        totalStaked: 0,
        tempApy: 12.5,
        stakersCount: 1204,
        myStake: 0
    });

    const [yieldStats, setYieldStats] = useState({
        distributedTotal: 0,
        lastDistribution: "Pending",
        nextDistribution: "Live",
        myPendingRewards: 0,
        rewardVaultBalance: 0
    });

    const [govStats, setGovStats] = useState({
        votingPower: 0,
        activeProposals: 3,
        participationRate: "68%"
    });

    // Actions State
    const [stakeAmount, setStakeAmount] = useState("");
    const [distributeAmount, setDistributeAmount] = useState("");


    // Effects
    const fetchStakingData = async () => {
        if (!wallet.publicKey) return;
        try {
            const program = getProgram();
            if (!program) return;

            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);

            // Fetch User Account for staking balance
            const [userAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user_account"), wallet.publicKey.toBuffer()],
                program.programId
            );

            let myStake = 0;
            try {
                const userAccount: any = await (program.account as any).UserAccount.fetch(userAccountPda);
                myStake = userAccount.stakedXls.toNumber() / 1e9;
            } catch (e) {
                console.log("No user account found yet");
            }

            let rewardBalance = 0;
            try {
                const balance = await connection.getTokenAccountBalance(configData.lxrVaultRewards);
                rewardBalance = balance.value.uiAmount || 0;
            } catch (e) { console.log("Vault empty or not init"); }

            setStakingStats(prev => ({
                ...prev,
                totalStaked: configData.totalStakedXls.toNumber() / 1e9,
                myStake: myStake
            }));

            setYieldStats(prev => ({
                ...prev,
                rewardVaultBalance: rewardBalance,
            }));

            setGovStats(prev => ({
                ...prev,
                votingPower: myStake * 1.5
            }));

        } catch (error) {
            console.error("Error fetching staking state:", error);
        }
    };

    useEffect(() => {
        fetchStakingData();
        const interval = setInterval(fetchStakingData, 30000);
        return () => clearInterval(interval);
    }, [wallet.publicKey, connection, config]);

    // Handlers
    const handleStake = async (action: 'deposit' | 'withdraw') => {
        if (!wallet.publicKey || !stakeAmount) return;
        setStatus("loading");
        setMessage(action === 'deposit' ? "Staking XLS..." : "Unstaking XLS...");

        try {
            const amount = new BN(parseFloat(stakeAmount) * 1e9);
            const program = getProgram();
            if (!program) return;

            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);

            const userXlsAta = await web3.PublicKey.findProgramAddressSync(
                [wallet.publicKey.toBuffer(), new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb").toBuffer(), configData.xlsMint.toBuffer()],
                new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
            )[0];

            let tx;
            if (action === 'deposit') {
                tx = await (program.methods as any).stake(amount).accounts({
                    user: wallet.publicKey,
                    globalConfig: configPda,
                    userXlsAccount: userXlsAta,
                    xlsMint: configData.xlsMint,
                    xlsVaultSupply: configData.xlsVaultSupply,
                    tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
                }).rpc();
            } else {
                tx = await (program.methods as any).unstake(amount).accounts({
                    user: wallet.publicKey,
                    globalConfig: configPda,
                    userXlsAccount: userXlsAta,
                    xlsMint: configData.xlsMint,
                    xlsVaultSupply: configData.xlsVaultSupply,
                    tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
                }).rpc();
            }

            setStatus("success");
            setMessage(action === 'deposit' ? `Successfully staked ${stakeAmount} XLS` : "Successfully unstaked");
            toast.success("Transaction Confirmed", { description: `Tx: ${tx.slice(0, 8)}...` });
            setStakeAmount("");
            fetchStakingData();
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message);
            toast.error("Action Failed", { description: err.message });
        }
    };

    const handleDistribute = async () => {
        if (!wallet.publicKey || !distributeAmount) return;
        setStatus("loading");
        setMessage("Distributing Rewards...");

        try {
            const amount = new BN(parseFloat(distributeAmount) * 1e9);
            const program = getProgram();
            if (!program) return;
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);

            const adminLxrAta = await web3.PublicKey.findProgramAddressSync(
                [wallet.publicKey.toBuffer(), new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb").toBuffer(), configData.lxrMint.toBuffer()],
                new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
            )[0];

            const tx = await (program.methods as any)
                .distributeRent(amount)
                .accounts({
                    admin: wallet.publicKey,
                    globalConfig: configPda,
                    adminLxrAccount: adminLxrAta,
                    rwaVaultLxr: configData.rwaVaultLxr,
                    lxrVaultRewards: configData.lxrVaultRewards,
                    lxrMint: configData.lxrMint,
                    tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
                })
                .rpc();

            setStatus("success");
            setMessage(`Distributed ${distributeAmount} LXR Successfully`);
            toast.success("Distribution Successful", { description: "60% to RWA, 40% to Stakers" });
            setDistributeAmount("");
            fetchStakingData();
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message);
            toast.error("Distribution Failed", { description: err.message });
        }
    };

    const SidebarItem = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative",
                activeTab === id ? "text-white" : "text-white/40 hover:text-white"
            )}
        >
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 bg-white transition-opacity duration-300",
                activeTab === id ? "opacity-100" : "opacity-0"
            )} />
            <Icon className={cn("w-5 h-5 shrink-0 transition-colors", activeTab === id ? "text-white" : "text-white/40 group-hover:text-white")} />
            <span className="text-sm font-medium tracking-tight text-left">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full min-h-[80vh] w-full animate-in fade-in duration-700">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col justify-between shrink-0 bg-[#050507]">
                <div>
                    <div className="px-8 pt-12 pb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white tracking-[0.2em] uppercase">{config.name} POOL</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Staking</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">Yield & Governance</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="dashboard" label="Dashboard" icon={PieChart} />
                        <div className="h-4" />
                        <SidebarItem id="staking" label="XLS Staking" icon={Lock} />
                        <SidebarItem id="yield" label="LXR Yield" icon={Coins} />
                        <SidebarItem id="governance" label="Governance" icon={Database} />
                    </div>
                </div>

                <div className="p-8">
                    <Link
                        href="/"
                        className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group"
                    >
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium tracking-wide">Return to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <StakingDashboard
                            key="dashboard"
                            stakingStats={stakingStats}
                            yieldStats={yieldStats}
                        />
                    )}

                    {activeTab === 'staking' && (
                        <ModuleGuard moduleId="xls" moduleFlags={moduleFlags}>
                            <XLSStaking
                                key="staking"
                                stakeAmount={stakeAmount}
                                setStakeAmount={setStakeAmount}
                                status={status}
                                message={message}
                                handleStake={handleStake}
                            />
                        </ModuleGuard>
                    )}

                    {activeTab === 'yield' && (
                        <LXRYield
                            key="yield"
                            distributeAmount={distributeAmount}
                            setDistributeAmount={setDistributeAmount}
                            status={status}
                            message={message}
                            handleDistribute={handleDistribute}
                        />
                    )}

                    {activeTab === 'governance' && (
                        <ModuleGuard moduleId="xls" moduleFlags={moduleFlags}>
                            <Governance
                                key="governance"
                                stakingStats={stakingStats}
                                govStats={govStats}
                            />
                        </ModuleGuard>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
