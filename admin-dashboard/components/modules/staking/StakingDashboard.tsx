
import React from "react";
import { Lock, Activity, Coins, PieChart } from "lucide-react";
import { motion } from "framer-motion";

interface StakingDashboardProps {
    stakingStats: {
        totalStaked: number;
        tempApy: number;
        stakersCount: number;
        myStake: number;
    };
    yieldStats: {
        distributedTotal: number;
        lastDistribution: string;
        nextDistribution: string;
        myPendingRewards: number;
    };
}

export const StakingDashboard = ({ stakingStats, yieldStats }: StakingDashboardProps) => {
    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">Staking Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TOTAL STAKED XLS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{stakingStats.totalStaked.toLocaleString()}</h3>
                        <span className="text-xs text-white/40">XLS</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <Lock className="w-3 h-3" />
                        <span>76% Supply Locked</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">CURRENT APY</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{stakingStats.tempApy}%</h3>
                        <span className="text-xs text-white/40">Variable</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <Activity className="w-3 h-3" />
                        <span>Stable Returns</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">REWARDS DISTRIBUTED</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{yieldStats.distributedTotal.toLocaleString()}</h3>
                        <span className="text-xs text-white/40">LXR</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-amber-500 text-[10px] font-medium">
                        <Coins className="w-3 h-3" />
                        <span>Lifetime Payouts</span>
                    </div>
                </div>
            </div>

            {/* Yield Chart Visualization */}
            <div className="p-12 border border-white/5 bg-white/[0.01] rounded-[3rem]">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <PieChart className="w-8 h-8 text-white/60" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-medium text-white tracking-tight">Yield Split Mechanism</h3>
                        <p className="text-[10px] text-white font-bold tracking-[0.3em] mt-2 opacity-60">AUTOMATED DISTRIBUTION</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative w-56 h-56 shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="12" strokeDasharray="376.99" strokeDashoffset="150.8" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="12" strokeDasharray="376.99" strokeDashoffset="226.2" style={{ transform: "rotate(216deg)", transformOrigin: "center" }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-light text-white tracking-tighter">LXR</span>
                            <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Flow</span>
                        </div>
                    </div>
                    <div className="w-full space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white font-medium">Protocol Vault (Reinvestment)</span>
                                <span className="text-sm text-white/60 font-mono">60%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-[#1a73e8] w-[60%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white font-medium">XLS Stakers (Yield)</span>
                                <span className="text-sm text-white/60 font-mono">40%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-[#fbbf24] w-[40%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
