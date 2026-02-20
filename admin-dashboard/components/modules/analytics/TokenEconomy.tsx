
import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const TokenEconomy = () => {
    return (
        <motion.div
            key="market"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <h1 className="text-4xl font-light text-white tracking-tight mb-12">Token Economy</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white">LXR Distribution</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Utility Token</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: "Community", val: "40%", color: "bg-amber-500" },
                            { label: "Reserve", val: "30%", color: "bg-amber-500/60" },
                            { label: "Team", val: "20%", color: "bg-amber-500/40" },
                            { label: "Investors", val: "10%", color: "bg-amber-500/20" },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs text-white mb-2">
                                    <span>{item.label}</span>
                                    <span className="font-bold">{item.val}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: item.val }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white">XLS Distribution</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Governance Token</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: "DAO Treasury", val: "60%", color: "bg-blue-500" },
                            { label: "Insiders", val: "20%", color: "bg-blue-500/60" },
                            { label: "Public Sale", val: "15%", color: "bg-blue-500/40" },
                            { label: "Airdrop", val: "5%", color: "bg-blue-500/20" },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs text-white mb-2">
                                    <span>{item.label}</span>
                                    <span className="font-bold">{item.val}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: item.val }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
