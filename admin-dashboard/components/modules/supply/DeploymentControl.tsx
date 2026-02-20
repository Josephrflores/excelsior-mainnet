
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Server, Wallet, CheckCircle2, AlertCircle, ChevronRight, Globe, ShieldCheck } from "lucide-react";
import { cn } from "../shared/index"; // Ensure correct import path
import walletData from "../../../lib/wallet-addresses.json";
import { useEnv } from "@/components/providers/EnvProvider";
import { useProtocol } from "../shared/useProtocol";
import { toast } from "sonner";

import { ProjectReports } from "@/components/dashboard/ProjectReports";

// Filter wallets that have SOL (potential payers)
const payingWallets = walletData.filter((w: any) => w.solBalance && w.solBalance > 0);

export const DeploymentControl = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [step, setStep] = useState<"select" | "deploying" | "success">("select");
    const [selectedNetwork, setSelectedNetwork] = useState<"devnet" | "testnet" | "mainnet">("devnet");
    const [selectedWallet, setSelectedWallet] = useState(payingWallets[0]?.address || "");
    const { isSimulation, setSimulation, env } = useEnv();
    const { connection, wallet } = useProtocol();

    const handleDeploy = () => {
        setStep("deploying");
        // Simulate network delay
        setTimeout(() => {
            setStep("success");
            // Here we would trigger the "gas deduction" visual update if we had global state for it
        }, 3000);
    };

    const reset = () => {
        setIsOpen(false);
        setTimeout(() => setStep("select"), 500);
    };

    const toggleSimulation = () => {
        if (!isSimulation) {
            setSimulation(true);
        } else {
            setIsOpen(true); // If already in simulation, open modal on click
        }
    };

    return (
        <>
            {/* Faucet / Airdrop Button - Only for Devnet/Testnet */}
            {(env === 'devnet' || env === 'testnet') && !isSimulation && (
                <button
                    onClick={async () => {
                        if (!wallet.publicKey) {
                            toast.error("Connect wallet first");
                            return;
                        }
                        try {
                            const sig = await connection.requestAirdrop(wallet.publicKey, 1 * 1_000_000_000);
                            toast.success("Airdrop requested! Wait for confirmation...");
                            await connection.confirmTransaction(sig);
                            toast.success("1 SOL Received!");
                        } catch (e) {
                            toast.error("Airdrop failed. Rate limit?");
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 hover:bg-blue-400/20 text-[10px] font-bold tracking-widest uppercase text-blue-300 transition-all hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] group"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    Faucet
                </button>
            )}

            {/* Reports / Manual Button */}
            <button
                onClick={() => setIsReportsOpen(true)}
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group relative",
                    "hover:border-amber-500/30"
                )}
                title="Mission Control Manual"
            >
                <ShieldCheck className="w-4 h-4 text-white/40 group-hover:text-amber-500 transition-colors" />
            </button>

            {/* Publish / Deploy Button - Opens Modal */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all cursor-pointer group hover:scale-105 active:scale-95",
                    "bg-white text-black border-transparent hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                )}
            >
                <Rocket className="w-3 h-3 text-black group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                    Publish
                </span>
            </button>

            {/* Reports Modal */}
            <ProjectReports isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={reset}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0A0A0C] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Modal Content */}
                            <div className="p-8">
                                {step === "select" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-medium text-white mb-2 flex items-center gap-2">
                                                <Rocket className="w-5 h-5 text-amber-500" />
                                                On-Chain Deployment
                                            </h2>
                                            <p className="text-white/40 text-sm">
                                                Confirm target network and paying authority.
                                            </p>
                                        </div>

                                        {/* Network Selection */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-mono text-white/30 uppercase tracking-widest">Target Network</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {(["devnet", "testnet", "mainnet"] as const).map((net) => (
                                                    <button
                                                        key={net}
                                                        onClick={() => setSelectedNetwork(net)}
                                                        className={cn(
                                                            "px-4 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2",
                                                            selectedNetwork === net
                                                                ? "bg-white/10 border-white/20 text-white"
                                                                : "bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.07]"
                                                        )}
                                                    >
                                                        <Globe className={cn("w-4 h-4", selectedNetwork === net ? "text-amber-500" : "text-white/20")} />
                                                        <span className="capitalize">{net}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Wallet Selection */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-mono text-white/30 uppercase tracking-widest">Paying Authority (Gas)</label>
                                            <div className="space-y-2">
                                                {payingWallets.map((w: any) => (
                                                    <button
                                                        key={w.address}
                                                        onClick={() => setSelectedWallet(w.address)}
                                                        className={cn(
                                                            "w-full px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between",
                                                            selectedWallet === w.address
                                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                                : "bg-white/5 border-white/5 hover:bg-white/[0.07]"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("p-2 rounded-lg", selectedWallet === w.address ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20")}>
                                                                <Wallet className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{w.name}</div>
                                                                <div className="text-[10px] font-mono text-white/30">{w.address.slice(0, 4)}...{w.address.slice(-4)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-white">{w.solBalance} SOL</div>
                                                            <div className="text-[10px] text-emerald-500/80">Available</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={handleDeploy}
                                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm tracking-wide hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            DEPLOY TO {selectedNetwork.toUpperCase()}
                                        </button>
                                    </div>
                                )}

                                {step === "deploying" && (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Server className="w-6 h-6 text-white/20" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-white">Deploying Contracts...</h3>
                                            <p className="text-white/40 text-sm mt-2">Uploading artifacts to {selectedNetwork}...</p>
                                        </div>
                                        <div className="w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                                className="h-full bg-amber-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === "success" && (
                                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-white">Deployment Successful</h3>
                                            <p className="text-white/40 text-sm mt-2">
                                                Project is live on {selectedNetwork.toUpperCase()}.<br />
                                                Gas fees deducted from Authority Wallet.
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 w-full border border-white/10">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-white/40">Status</span>
                                                <span className="text-emerald-400">Confirmed</span>
                                            </div>
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-white/40">Network</span>
                                                <span className="text-white capitalize">{selectedNetwork}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/40">Contract ID</span>
                                                <span className="font-mono text-white/60">ExC...9xV</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={reset}
                                            className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                                        >
                                            Return to Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
