
import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useProtocol, cn } from "../shared/index";
import { BN, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

export const LiquidityManagement = () => {
    const { status, setStatus, setMessage, message, getProgram, wallet } = useProtocol();
    const [selectedPool, setSelectedPool] = useState<"LXR-USDC" | "XLS-SOL">("LXR-USDC");
    const [currentConfig, setCurrentConfig] = useState<any>(null);
    const [rebalanceAmount, setRebalanceAmount] = useState("");
    const [targetWallet, setTargetWallet] = useState("");

    const fetchLiquidityData = async () => {
        const program = getProgram();
        if (!program) return;
        try {
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);
            setCurrentConfig(configData);
        } catch (error) {
            console.error("Error fetching policy state:", error);
        }
    };

    useEffect(() => {
        fetchLiquidityData();
    }, []);

    const handleRebalance = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey || !currentConfig) return;
        setStatus("loading");
        setMessage("Requesting treasury withdrawal...");

        try {
            const amount = new BN(parseFloat(rebalanceAmount) * 1e9);
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);

            // Generate request PDA
            const [requestPda] = PublicKey.findProgramAddressSync([
                Buffer.from("withdrawal"),
                wallet.publicKey.toBuffer(),
                currentConfig.dailyWithdrawalAmount.toBuffer('le', 8)
            ], program.programId);

            const tx = await (program.methods as any).requestWithdrawal(
                amount,
                new PublicKey(targetWallet)
            ).accounts({
                admin: wallet.publicKey,
                globalConfig: configPda,
                withdrawalRequest: requestPda,
                lxrMint: currentConfig.lxrMint,
                systemProgram: web3.SystemProgram.programId,
            }).rpc();

            setStatus("success");
            setMessage("Rebalance request submitted (Timelock Active)");
            toast.success("Request Submitted", { description: `Tx: ${tx.slice(0, 8)}...` });
            setRebalanceAmount("");
            setTargetWallet("");
            fetchLiquidityData();
        } catch (error: any) {
            console.error("Rebalance error:", error);
            setStatus("error");
            setMessage(error.message || "Failed to submit request");
            toast.error("Submission Failed", { description: error.message });
        }
    };

    return (
        <motion.div
            key="liquidity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
        >
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Activity className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tight">Liquidity Management</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">AMM Pools & Protocol Owned Liquidity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pool Selector & Config */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-light text-white">Active Pools</h3>
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setSelectedPool("LXR-USDC")}
                                className={cn(
                                    "px-4 py-2 text-xs font-medium rounded-md transition-all",
                                    selectedPool === "LXR-USDC" ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white"
                                )}
                            >
                                LXR-USDC
                            </button>
                            <button
                                onClick={() => setSelectedPool("XLS-SOL")}
                                className={cn(
                                    "px-4 py-2 text-xs font-medium rounded-md transition-all",
                                    selectedPool === "XLS-SOL" ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white"
                                )}
                            >
                                XLS-SOL
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">Total Value Locked (TVL)</span>
                            <span className="text-sm font-mono text-white">$450,200.00</span>
                        </div>
                        <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">24h Volume</span>
                            <span className="text-sm font-mono text-white">$12,500.00</span>
                        </div>
                        <div className="flex justify-between p-4 bg-white/5 rounded-xl border border-blue-500/10 bg-blue-500/5">
                            <span className="text-xs text-blue-400 font-bold">Protocol Owned</span>
                            <span className="text-sm font-mono text-blue-400">98.5%</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] text-white/40 mb-4 uppercase tracking-widest font-bold">Pool Actions</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-all">Add Liquidity</button>
                            <button className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-all">Remove Liquidity</button>
                        </div>
                    </div>
                </div>

                {/* Treasury Rebalancing */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-light text-white">Treasury Rebalance</h3>
                            <p className="text-xs text-white/40">Move protocol funds via Timelock</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest px-1">AMOUNT (LXR)</label>
                            <input
                                type="number"
                                value={rebalanceAmount}
                                onChange={(e) => setRebalanceAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-violet-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest px-1">TARGET WALLET</label>
                            <input
                                type="text"
                                value={targetWallet}
                                onChange={(e) => setTargetWallet(e.target.value)}
                                placeholder="Public Key..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-mono text-[10px] outline-none focus:border-violet-500/50"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleRebalance}
                        disabled={status === 'loading' || !rebalanceAmount || !targetWallet}
                        className="w-full py-4 bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-500/30 transition-all"
                    >
                        {status === 'loading' && message.includes("Treasury") ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Initiate Withdrawal"}
                    </button>

                    {status !== 'idle' && message.includes("Withdrawal") && (
                        <div className={cn(
                            "p-3 rounded-lg text-[10px] font-medium flex items-center justify-center gap-2",
                            status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
