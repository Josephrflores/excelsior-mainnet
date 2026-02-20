
import React from "react";
import { RefreshCw, ArrowRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";
import { ASSETS, FLIGHT_WALLETS } from "./constants";

interface FleetOverviewProps {
    balances: Record<string, { sol: number, lxr: number, xls: number, usdx: number }>;
    isFetchingBalances: boolean;
    fetchBalances: () => void;
    setActiveTab: (tab: any) => void;
}

export const FleetOverview = ({ balances, isFetchingBalances, fetchBalances, setActiveTab }: FleetOverviewProps) => {
    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-12"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-white tracking-tight">Fleet Overview</h1>
                <button onClick={() => fetchBalances()} className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all text-xs font-medium text-white">
                    <RefreshCw className={cn("w-4 h-4", isFetchingBalances && "animate-spin")} />
                    <span>Sync All Nodes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Aggregate Balances (Sum of all wallets) */}
                {ASSETS.map(asset => {
                    const total = FLIGHT_WALLETS.reduce((acc, w) => acc + (balances[w.address]?.[asset.id as 'sol' | 'lxr' | 'xls' | 'usdx'] || 0), 0);
                    return (
                        <div key={asset.id} onClick={() => setActiveTab(asset.id as any)} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group cursor-pointer hover:bg-white/[0.04] transition-all">
                            <div className={cn("absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity", asset.color)}>
                                <asset.icon className="w-12 h-12" />
                            </div>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">{asset.name} Total</p>
                            <div className="flex items-baseline gap-2 relative z-10">
                                <h3 className="text-3xl text-white font-light tracking-tighter">{total.toLocaleString()}</h3>
                                <span className="text-xs text-white/40">{asset.symbol}</span>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-[10px] font-medium text-white/20 group-hover:text-white/60 transition-colors">
                                <span>Manage Transfers</span>
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Fleet Holdings</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {FLIGHT_WALLETS.slice(0, 5).map((w, i) => (
                        <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20"><Wallet className="w-3 h-3" /></div>
                                <div>
                                    <p className="text-sm font-medium text-white">{w.name}</p>
                                    <p className="text-[10px] text-white/40 font-mono">{w.address.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                {ASSETS.map(a => (
                                    <div key={a.id} className="text-right">
                                        <p className="text-xs text-white/60 font-mono">{(balances[w.address]?.[a.id as 'sol'] || 0).toLocaleString()}</p>
                                        <p className="text-[8px] text-white/20 uppercase tracking-wide">{a.symbol}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
