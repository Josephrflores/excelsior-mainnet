
import React from "react";
import { Activity, Wallet, Database } from "lucide-react";
import { motion } from "framer-motion";

interface ProtocolStatsProps {
    stats: {
        lxrSupply: number;
        xlsSupply: number;
        lxrTreasury: number;
        xlsTreasury: number;
    };
    loading: boolean;
}

export const ProtocolStats = ({ stats, loading }: ProtocolStatsProps) => {
    return (
        <motion.div
            key="on-chain"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 w-full"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">Protocol Statistics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">LXR SUPPLY</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl text-white font-light tracking-tighter truncate">
                            {loading ? "Syncing..." : stats.lxrSupply.toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-[10px] font-medium">
                        <Activity className="w-3 h-3" />
                        <span>Live</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">XLS SUPPLY</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl text-white font-light tracking-tighter truncate">
                            {loading ? "Syncing..." : stats.xlsSupply.toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-medium">
                        <Activity className="w-3 h-3" />
                        <span>Live</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TREASURY LXR</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl text-white font-light tracking-tighter truncate">
                            {loading ? "Syncing..." : stats.lxrTreasury.toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <Wallet className="w-3 h-3" />
                        <span>Secured</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TREASURY XLS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl text-white font-light tracking-tighter truncate">
                            {loading ? "Syncing..." : stats.xlsTreasury.toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-purple-400 text-[10px] font-medium">
                        <Wallet className="w-3 h-3" />
                        <span>Secured</span>
                    </div>
                </div>
            </div>

            {/* Activity Chart Placeholder */}
            <div className="p-10 border border-white/5 bg-white/[0.01] rounded-3xl h-96 flex flex-col justify-center items-center text-center">
                <Activity className="w-12 h-12 text-white/10 mb-6" strokeWidth={1} />
                <h3 className="text-white text-lg font-medium tracking-tight">Network Activity Graph</h3>
                <p className="text-white/40 text-sm mt-2 max-w-xs">Connecting to Helius RPC to visualize recent transaction throughput...</p>
            </div>
        </motion.div>
    );
};
