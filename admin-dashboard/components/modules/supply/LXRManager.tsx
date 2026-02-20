
import React, { useState } from "react";
import { Coins, Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEnv } from "@/components/providers/EnvProvider";
import { useProtocol } from "../shared/useProtocol";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { cn } from "../shared/index";

interface LXRManagerProps {
    stats: {
        lxrBurned: string;
        inflationRate: string;
        nextHalving: string;
    };
}

export const LXRManager = ({ stats }: LXRManagerProps) => {
    const { isSimulation, env } = useEnv();
    const { getProgram, wallet } = useProtocol();
    const [mintAmount, setMintAmount] = useState("");
    const [burnAmount, setBurnAmount] = useState("");
    const [loading, setLoading] = useState<"mint" | "burn" | null>(null);

    const isMainnet = env === "mainnet";
    const canMint = isSimulation || env === "devnet" || env === "testnet"; // Mainnet requires Multisig (disabled here)

    const handleAction = async (type: "mint" | "burn", amount: string) => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (type === 'mint' && !canMint) {
            toast.error("Minting on Mainnet requires Governance Proposal (Multisig). Action Blocked.");
            return;
        }

        setLoading(type);

        try {
            if (isSimulation) {
                // SIMULATION MODE
                await new Promise(resolve => setTimeout(resolve, 2000)); // Fake delay
                toast.success(`SIMULATION: ${type === 'mint' ? 'Minted' : 'Burned'} ${amount} LXR successfully.`);
            } else {
                // REAL ON-CHAIN MODE
                if (!wallet.publicKey) {
                    toast.error("Wallet not connected");
                    return;
                }

                const program = getProgram();
                if (!program) throw new Error("Program not initialized");

                const amountBN = new BN(Number(amount) * 1_000_000_000); // 9 decimals

                if (type === 'mint') {
                    // Call mint instruction (placeholder for actual instruction name)
                    // await program.methods.mintLxr(amountBN).rpc();
                    toast.info("Minting on-chain is theoretically enabled but disabled in this demo safety version.");
                } else {
                    // Call burn instruction
                    // await program.methods.burnLxr(amountBN).rpc();
                    toast.info("Burning on-chain is theoretically enabled but disabled in this demo safety version.");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${type} LXR: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(null);
            if (type === 'mint') setMintAmount("");
            else setBurnAmount("");
        }
    };

    return (
        <motion.div
            key="lxr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">LXR Manager</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mint Section */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-white">Emission Control</h3>
                                <p className="text-xs text-white/40">Minting & Inflation</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">Inflation Rate</span>
                            <span className="text-xs text-white font-mono">{stats.inflationRate}% / yr</span>
                        </div>
                        <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">Next Halving</span>
                            <span className="text-xs text-white font-mono">{stats.nextHalving}</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Mint Rewards</p>
                        <div className="flex gap-4">
                            <input
                                value={mintAmount}
                                onChange={(e) => setMintAmount(e.target.value)}
                                placeholder={isMainnet ? "Protected Function" : "Amount"}
                                disabled={loading !== null || !canMint}
                                className={cn(
                                    "flex-1 border rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-50",
                                    !canMint ? "bg-red-500/5 border-red-500/10 text-red-500 placeholder:text-red-500/40 cursor-not-allowed" : "bg-white/5 border-white/5 text-white"
                                )}
                            />
                            <button
                                onClick={() => handleAction('mint', mintAmount)}
                                disabled={loading !== null || !canMint}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                    !canMint
                                        ? "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white"
                                )}
                            >
                                {loading === 'mint' && <Loader2 className="w-3 h-3 animate-spin" />}
                                {isMainnet ? "Multisig Only" : "Mint"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Burn Section */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                <Flame size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-white">Burn Station</h3>
                                <p className="text-xs text-white/40">Deflationary Actions</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-xs text-white/60">Total Burned</span>
                            <span className="text-xs text-rose-400 font-mono">{stats.lxrBurned} LXR</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Execute Burn</p>
                        <div className="flex gap-4">
                            <input
                                value={burnAmount}
                                onChange={(e) => setBurnAmount(e.target.value)}
                                placeholder="Amount"
                                disabled={loading !== null}
                                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleAction('burn', burnAmount)}
                                disabled={loading !== null}
                                className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 disabled:opacity-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                {loading === 'burn' && <Loader2 className="w-3 h-3 animate-spin" />}
                                Burn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
