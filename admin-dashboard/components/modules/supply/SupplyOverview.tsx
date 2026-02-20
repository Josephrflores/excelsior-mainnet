
import React from "react";
import { ArrowRight, Globe, Flame, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface SupplyOverviewProps {
    stats: {
        lxrSupply: string;
        xlsSupply: string;
        usdxSupply: string;
        lxrBurned: string;
        feeBasisPoints: string;
        inflationRate: string;
        nextHalving: string;
        circulatingPct?: string;
    };
}

export const SupplyOverview = ({ stats }: SupplyOverviewProps) => {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 w-full"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-white tracking-tight">Protocol Supply Overview</h1>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-white font-medium">System Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* LXR Supply */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TOTAL SUPPLY (LXR)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{stats.lxrSupply}</h3>
                        <span className="text-xs text-white/40">LXR</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <ArrowRight className="w-3 h-3" />
                        <span>Hard Cap Reached</span>
                    </div>
                </div>

                {/* XLS Supply */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TOTAL SUPPLY (XLS)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{stats.xlsSupply}</h3>
                        <span className="text-xs text-white/40">XLS</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-[10px] font-medium">
                        <ArrowRight className="w-3 h-3" />
                        <span>Governance Token</span>
                    </div>
                </div>

                {/* USDX Supply */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">CIRCULATING (USDX)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">
                            {Number(stats.usdxSupply).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <span className="text-xs text-white/40">USDX</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                            <Globe className="w-3 h-3" />
                            <span>Stablecoin Peg</span>
                        </div>
                        <div className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase">
                            Proof of Reserve: 100%
                        </div>
                    </div>
                </div>

                {/* Burned */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">GLOBAL BURNED</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{stats.lxrBurned}</h3>
                        <span className="text-sm text-white/40">LXR</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs font-medium">
                        <Flame className="w-3 h-3" />
                        <span>Deflationary Mechanism Active</span>
                    </div>
                </div>

                {/* Circulating */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">CIRCULATING FLOAT</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl text-white font-light tracking-tighter">{stats.circulatingPct || "0.00"}%</h3>
                        <span className="text-xs text-white/40">LXR</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-medium">
                        <Globe className="w-3 h-3" />
                        <span>Liquid Market</span>
                    </div>
                </div>

                {/* Fees */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TRANSACTION FEE</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{stats.feeBasisPoints}%</h3>
                        <span className="text-sm text-white/40">Base Rate</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-xs font-medium">
                        <RefreshCw className="w-3 h-3" />
                        <span>Auto-Distribution</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* LXR Distribution Chart */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium text-white tracking-tight">LXR Distribution</h3>
                        <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                            <span className="text-[10px] font-bold text-blue-400 tracking-widest">UTILITY</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative w-48 h-48 shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="150.8" className="transition-all duration-1000 ease-out" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="301.6" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(216deg)", transformOrigin: "center" }} />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="339.3" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(288deg)", transformOrigin: "center" }} />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="343.1" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(324deg)", transformOrigin: "center" }} />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="373.2" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(356.4deg)", transformOrigin: "center" }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-light text-white tracking-tighter">100%</span>
                                <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Minted</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            {[
                                { label: "Locked Reserve", value: "60%", color: "bg-[#1a73e8]" },
                                { label: "Vesting Holding", value: "20%", color: "bg-amber-400" },
                                { label: "Operations", value: "10%", color: "bg-pink-500" },
                                { label: "Founder Lock", value: "9%", color: "bg-rose-400" },
                                { label: "Liquid Pool", value: "1%", color: "bg-emerald-400" },
                            ].map((item, id) => (
                                <div key={id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                        <span className="text-xs text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-mono text-white/40">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* XLS Distribution Chart */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-medium text-white tracking-tight">XLS Distribution</h3>
                        <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                            <span className="text-[10px] font-bold text-amber-400 tracking-widest">GOVERNANCE</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative w-48 h-48 shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {/* Reusing scale for visual consistency, assuming parallel distribution */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a73e8" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="150.8" className="transition-all duration-1000 ease-out" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="301.6" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(216deg)", transformOrigin: "center" }} />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="339.3" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(288deg)", transformOrigin: "center" }} />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="343.1" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(324deg)", transformOrigin: "center" }} />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="376.99" strokeDashoffset="373.2" className="transition-all duration-1000 ease-out" style={{ transform: "rotate(356.4deg)", transformOrigin: "center" }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-light text-white tracking-tighter">100%</span>
                                <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Capped</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            {[
                                { label: "Equity Reserve", value: "60%", color: "bg-[#1a73e8]" },
                                { label: "Team Vesting", value: "20%", color: "bg-amber-400" },
                                { label: "Treasury", value: "10%", color: "bg-pink-500" },
                                { label: "Advisors", value: "9%", color: "bg-rose-400" },
                                { label: "Public Alloc", value: "1%", color: "bg-emerald-400" },
                            ].map((item, id) => (
                                <div key={id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                        <span className="text-xs text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-mono text-white/40">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
