
import React from "react";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface FeeManagerProps {
    feeActive: boolean;
    setFeeActive: (active: boolean) => void;
}

export const FeeManager = ({ feeActive, setFeeActive }: FeeManagerProps) => {
    return (
        <motion.div
            key="fees"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">Fee Manager</h1>

            <div className="p-10 border border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center border border-[#1a73e8]/20">
                            <Activity className="w-6 h-6 text-[#1a73e8]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Dynamic Fees</h3>
                            <p className="text-[10px] text-white/60 font-bold tracking-[0.2em] mt-1">TRANSFER HOOK MANAGER</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setFeeActive(!feeActive)}
                        className={cn(
                            "w-12 h-6 rounded-full p-1 transition-all duration-300",
                            feeActive ? "bg-[#1a73e8] justify-end" : "bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                            feeActive ? "translate-x-6" : ""
                        )} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-sm text-white font-medium">Temporary Stabilization Fee</p>
                            <p className="text-[10px] text-white/40 mt-1">Activate 5% fee on selling pressure</p>
                        </div>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", feeActive ? "text-[#1a73e8]" : "text-white/20")}>
                            {feeActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Whitelisted Addresses</label>
                        <div className="flex flex-wrap gap-2">
                            {["0x71c...82a", "0x12a...912"].map(addr => (
                                <span key={addr} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-white/60 font-mono">{addr}</span>
                            ))}
                            <button className="px-3 py-1 border border-dashed border-[#1a73e8]/30 text-[#1a73e8] rounded-full text-[10px] font-medium hover:bg-[#1a73e8]/5 transition-all">
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
