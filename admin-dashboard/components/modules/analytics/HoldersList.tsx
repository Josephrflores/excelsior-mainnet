
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import walletData from "@/lib/wallet-addresses.json";
import { cn } from "../shared/index";

export const HoldersList = () => {
    return (
        <motion.div
            key="holders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-12">
                <h1 className="text-4xl font-light text-white tracking-tight">Top Holders</h1>
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/60 tracking-widest">
                    Live Census
                </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Rank</th>
                                <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Entity</th>
                                <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Balance (LXR)</th>
                                <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Share</th>
                                <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {walletData.slice(0, 10).map((wallet: any, i) => (
                                <tr key={wallet.address} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="p-8">
                                        <span className="text-xs font-mono text-white/60 group-hover:text-cyan-400 transition-colors">#{String(i + 1).padStart(2, '0')}</span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white tracking-tight mb-1">{wallet.name}</span>
                                            <span className="text-[10px] font-mono text-white/30">{wallet.address.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-sm font-light text-white tabular-nums tracking-tight">
                                            {(Math.random() * 1000000 + 500000).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className="bg-cyan-500 h-full" style={{ width: `${(10 - i) * 5}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <span className={cn(
                                            "text-[9px] font-bold tracking-widest px-3 py-1 rounded-lg uppercase",
                                            wallet.isFounder ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-white/5 text-white/60 border border-white/5"
                                        )}>
                                            {wallet.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
                    <button className="flex items-center gap-2 mx-auto text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase hover:text-white transition-colors group">
                        View Full Ledger
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
