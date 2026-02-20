
import React from "react";
import { PieChart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";
import { useEnv } from "@/components/providers/EnvProvider";

interface XLSManagerProps {
    vestingData: any;
    handleClaimVesting: () => void;
    status: string;
}

export const XLSManager = ({ vestingData, handleClaimVesting, status }: XLSManagerProps) => {
    const isCliff = vestingData ? Date.now() / 1000 < vestingData.cliffEnd.toNumber() : true;
    const totalAmount = vestingData ? (vestingData.totalAmount.toNumber() / 1e9) : 0;
    const releasedAmount = vestingData ? (vestingData.releasedAmount.toNumber() / 1e9) : 0;

    // Simple calculation for UI visualization
    const progressPerc = totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;

    const { isSimulation, env } = useEnv();
    const isMainnet = env === "mainnet";
    // Allow simulation, devnet, testnet. Block Mainnet.
    const canRelease = isSimulation || env === "devnet" || env === "testnet";

    const onReleaseClick = () => {
        if (!canRelease) return;
        handleClaimVesting();
    };

    return (
        <motion.div
            key="xls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">XLS Manager</h1>

            {/* Vesting Visualizer */}
            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white">Vesting Schedule</h3>
                            <p className="text-xs text-white/40">Real-time Token Unlocks</p>
                        </div>
                    </div>
                    {vestingData && (
                        <div className={cn(
                            "px-4 py-2 rounded-full border",
                            isCliff ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        )}>
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {isCliff ? "CLIFF PERIOD ACTIVE" : "RELEASING TRANCHES"}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                        {/* Timeline Bar */}
                        <div
                            className="absolute top-0 bottom-0 left-0 bg-emerald-500 z-10 transition-all duration-1000"
                            style={{ width: `${progressPerc}%` }}
                        />
                        <div className="absolute top-0 bottom-0 left-0 w-full bg-white/5 z-0" />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 font-mono uppercase tracking-widest">
                        <span>Genesis</span>
                        <span>{(releasedAmount).toLocaleString()} XLS Released</span>
                        <span>{totalAmount.toLocaleString()} XLS Total</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 bg-white/5 rounded-2xl">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Next Unlock</p>
                        <p className="text-xl text-white font-medium">Monthly Release</p>
                        <p className="text-xs text-white/20 mt-1">Linear after cliff</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Structure</p>
                        <p className="text-xl text-white font-medium">{vestingData ? "Founder Lock" : "Standard"}</p>
                        <p className="text-xs text-white/20 mt-1">24 Month Duration</p>
                    </div>
                    <button
                        onClick={onReleaseClick}
                        disabled={status === 'loading' || isCliff || !vestingData || !canRelease}
                        className={cn(
                            "p-6 border rounded-2xl transition-all flex flex-col justify-center items-center group",
                            (isCliff || !vestingData || !canRelease)
                                ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed"
                                : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20"
                        )}
                    >
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            !canRelease ? "text-red-400" : "text-amber-400 group-hover:text-amber-300"
                        )}>
                            {isMainnet ? "Locked (Multisig)" : "Release Tranche"}
                        </span>
                        {!isMainnet && <ArrowRight className="w-4 h-4 text-amber-400 mt-2 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
