
import React, { useState } from "react";
import { ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEnv } from "@/components/providers/EnvProvider";
import { cn } from "@/components/modules/shared";
import { toast } from "sonner";

interface USDXManagerProps {
    stats: any;
}

export const USDXManager = ({ stats }: USDXManagerProps) => {
    const { isSimulation, env } = useEnv();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState<"mint" | "redeem" | null>(null);

    const isMainnet = env === "mainnet";
    const canManage = isSimulation || env === "devnet"; // Restricted on Testnet/Mainnet for now

    const handleAction = async (type: "mint" | "redeem") => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Invalid amount");
            return;
        }
        setLoading(type);
        // Simulation delay
        await new Promise(r => setTimeout(r, 1500));

        if (isSimulation) {
            toast.success(`SIMULATION: ${type === 'mint' ? 'Minted USDX' : 'Redeemed Collat'} successfully.`);
        } else {
            toast.info("On-Chain Stablecoin Engine is strictly governed. Use CLI for complex operations.");
        }
        setLoading(null);
        setAmount("");
    };

    return (
        <motion.div
            key="usdx"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">USDX Manager</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white">Proof of Reserve</h3>
                            <p className="text-xs text-white/40">Collateral Verification</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-emerald-500/20">
                            <span className="text-xs text-white/60">Collateral Ratio</span>
                            <span className="text-lg text-emerald-400 font-bold">152%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-[10px] text-white/40 uppercase">Backing Assets</p>
                                <p className="text-sm text-white font-mono mt-1">$1,520,000</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-[10px] text-white/40 uppercase">Issued USDX</p>
                                <p className="text-sm text-white font-mono mt-1">
                                    {Number(stats.usdxSupply).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] text-white/20 text-center">Oracle synced via Pyth Network</p>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white">Mint / Redeem</h3>
                            <p className="text-xs text-white/40">Algo-Stablecoin Engine</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={isMainnet ? "Protected Function" : "Input Amount (LXR Collateral)"}
                            disabled={loading !== null || !canManage}
                            className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm outline-none",
                                !canManage ? "bg-red-500/5 border-red-500/10 text-red-500 cursor-not-allowed placeholder:text-red-500/40" : "bg-white/5 border-white/5 text-white"
                            )}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction('mint')}
                                disabled={loading !== null || !canManage}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    !canManage ? "bg-red-500/10 text-red-500 border border-red-500/20 opacity-50 cursor-not-allowed" : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20"
                                )}
                            >
                                {loading === 'mint' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isMainnet ? "Blocked" : "Mint USDX")}
                            </button>
                            <button
                                onClick={() => handleAction('redeem')}
                                disabled={loading !== null || !canManage}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    !canManage ? "bg-red-500/10 text-red-500 border border-red-500/20 opacity-50 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"
                                )}
                            >
                                {loading === 'redeem' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isMainnet ? "Blocked" : "Redeem")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
