
import React from "react";
import { TrendingUp, Activity, Landmark, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const EconomicOverview = () => {
    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">Economic Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Inflation Card */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">LXR INFLATION RATE</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">2.5%</h3>
                        <span className="text-xs text-white/40">APY</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-violet-400 text-[10px] font-medium">
                        <TrendingUp className="w-3 h-3" />
                        <span>Target Met</span>
                    </div>
                </div>

                {/* USDX Peg Card */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">USDX PEG STATUS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">$1.00</h3>
                        <span className="text-xs text-white/40">USD</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <Activity className="w-3 h-3" />
                        <span>Stable</span>
                    </div>
                </div>

                {/* Reserve Ratio */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">RESERVE RATIO</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">142%</h3>
                        <span className="text-xs text-white/40">Over-Collateralized</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-medium">
                        <Landmark className="w-3 h-3" />
                        <span>Solvent</span>
                    </div>
                </div>
            </div>

            <div className="p-12 border border-white/5 bg-white/[0.01] rounded-[3rem] flex items-center gap-8">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                    <Globe className="w-8 h-8 text-white/40" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-light text-white">Global Economic State</h3>
                    <p className="text-sm text-white/40 max-w-2xl">
                        The protocol is currently operating in a healthy economic application state.
                        LXR inflation is within target bounds (2-3%), and the USDX peg is maintained through
                        automated arbitrage mechanisms and RWA collateral backing.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
