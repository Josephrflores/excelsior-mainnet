
import React from "react";
import { motion } from "framer-motion";
import walletData from "../../../lib/wallet-addresses.json";

import { WalletPortfolio } from "./WalletPortfolio";
import { ChevronDown, ChevronRight, Wallet } from "lucide-react";
import { useState } from "react";

const CATEGORIES = {
    "Master": { label: "Master & Governance", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    "Founder": { label: "Founders & Operations", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    "Fees": { label: "Revenue & Fee Collection", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    "Assets": { label: "Strategic Assets & Funds", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    "Rewards": { label: "Incentives & Inflation", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    "Holding": { label: "Private Holdings", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    "Dead": { label: "Non-Circulating / Locked", color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

export const FleetRegistry = () => {
    // Group wallets
    const groupedWallets = walletData.reduce((acc: any, wallet: any) => {
        const type = wallet.type || "Other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(wallet);
        return acc;
    }, {});

    // Sort categories order
    const categoryOrder = ["Master", "Founder", "Fees", "Assets", "Rewards", "Holding", "Dead", "Other"];

    let globalIndex = 0;

    return (
        <motion.div
            key="registry"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pb-20"
        >
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-light text-white tracking-tight">Fleet Registry</h1>
                    <p className="text-white/40 text-xs mt-1">Official Protocol Wallet Directory</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        {walletData.length} Tracked Entities
                    </span>
                </div>
            </div>

            <div className="space-y-8">
                {categoryOrder.map((type) => {
                    const wallets = groupedWallets[type];
                    if (!wallets) return null;
                    const style = CATEGORIES[type as keyof typeof CATEGORIES] || { label: type, color: "text-white", bg: "bg-white/5", border: "border-white/10" };

                    return (
                        <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${style.bg} ${style.color} ${style.border} border`}>
                                    {style.label}
                                </div>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>

                            <div className="w-full border border-white/5 rounded-2xl overflow-hidden bg-[#0A0A0C]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-white/5">
                                            <th className="p-4 w-[30%] text-[9px] font-medium text-white/30 tracking-widest uppercase">Entity Name</th>
                                            <th className="p-4 w-[35%] text-[9px] font-medium text-white/30 tracking-widest uppercase">Role Description</th>
                                            <th className="p-4 w-[35%] text-[9px] font-medium text-white/30 tracking-widest uppercase text-right">Live Portfolio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {wallets.map((w: any) => (
                                            <tr key={w.address} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                                                            {w.name}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-white/20 select-all cursor-pointer hover:text-white/40 transition-colors">
                                                            {w.address}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <span className="text-xs text-white/40 leading-relaxed block max-w-md">
                                                        {w.description}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <div className="flex justify-end">
                                                        <WalletPortfolio
                                                            address={w.address}
                                                            index={globalIndex++}
                                                            expectedLxr={w.expectedLxr}
                                                            solBalance={w.solBalance}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};
