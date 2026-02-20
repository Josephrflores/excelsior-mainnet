
import React from "react";
import { Users, ShieldCheck, ArrowUpRight, Flame, Eye } from "lucide-react";
import { motion } from "framer-motion";

export const Multisig = () => {
    return (
        <motion.div
            key="multisig"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <h1 className="text-4xl font-light text-white tracking-tight mb-12">Squads Governance</h1>

            <div className="p-10 border border-[#1a73e8]/20 bg-[#1a73e8]/[0.05] rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12">
                    <Users className="w-32 h-32 text-[#1a73e8]/5 group-hover:scale-110 transition-transform duration-1000" />
                </div>

                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <ShieldCheck className="w-6 h-6 text-[#1a73e8]" />
                            <h3 className="text-2xl font-light text-white tracking-tight">Mainnet Orchestration</h3>
                        </div>
                        <p className="text-[10px] text-white font-black tracking-[0.3em] uppercase opacity-60 ml-10">Safe Multisig Vault</p>
                    </div>
                    <button className="flex items-center gap-3 px-6 py-3 bg-[#1a73e8]/10 border border-[#1a73e8]/20 rounded-2xl text-[#1a73e8] text-[10px] font-bold hover:bg-[#1a73e8]/20 transition-all uppercase tracking-widest">
                        Manage Vault <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                    <div className="space-y-6">
                        <div className="p-8 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-xl">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-6">Quorum Health</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-light text-white tracking-tighter">3/5</span>
                                <span className="text-xs text-white/40 font-medium">Signatures</span>
                            </div>
                            <div className="mt-8 flex gap-2">
                                {[1, 2, 3].map(i => <div key={i} className="flex-1 h-2 bg-[#1a73e8] rounded-full shadow-[0_0_10px_#1a73e8]" />)}
                                {[4, 5].map(i => <div key={i} className="flex-1 h-2 bg-white/10 rounded-full" />)}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        <p className="text-sm text-white/60 leading-relaxed max-w-lg">
                            Critical actions (Force-Burn, Mint Authority Changes) will be proposed to the Squads Vault.
                            No single entity can execute these instructions without peer approval active.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group/tx hover:bg-white/10 transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                        <Flame size={20} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">Proposal #104: Emergency Burn</p>
                                        <p className="text-[10px] text-white/20 font-mono tracking-wider">ID: 8vH4...amLR</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-4 py-2 rounded-full bg-white/5 text-[10px] text-white font-bold tracking-widest border border-white/10">PENDING (2/3)</span>
                                    <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover/tx:text-white transition-all">
                                        <Eye size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
