
import React from "react";
import { Flame, Settings2, RefreshCw, Fingerprint, ShieldCheck, UserPlus, Lock, Unlock, Siren } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface EmergencyProps {
    status: string;
    fetchSecurityState: () => void;
    handleSetPause: (pause: boolean) => void;
    accessControl: any;
}

export const Emergency = ({ status, fetchSecurityState, handleSetPause, accessControl }: EmergencyProps) => {
    const isPaused = accessControl?.paused || false;
    return (
        <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-12">
                <h1 className="text-4xl font-light text-white tracking-tight">Emergency Intervention</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleSetPause(!isPaused)}
                        className={cn(
                            "px-8 py-4 rounded-2xl border transition-all flex items-center gap-3 group",
                            isPaused
                                ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        )}
                    >
                        {isPaused ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {isPaused ? "RESUME PROTOCOL" : "PAUSE PROTOCOL"}
                        </span>
                    </button>
                    <button
                        onClick={() => fetchSecurityState()}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                    >
                        <RefreshCw size={20} className={cn(status === 'loading' && "animate-spin")} />
                    </button>
                </div>
            </div>

            {isPaused && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-red-500/20 border border-red-500/50 rounded-3xl mb-12 flex items-center justify-center gap-4 text-red-500 animate-pulse"
                >
                    <Siren className="w-6 h-6" />
                    <span className="text-sm font-black uppercase tracking-[0.3em]">Protocol Highly Secured / Operations Paused</span>
                </motion.div>
            )}

            {/* Force-Burn Hub */}
            <div className="p-10 border border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] rounded-3xl mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                            <Flame className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Force-Burn Hub</h3>
                            <p className="text-[10px] text-red-500/60 font-bold tracking-[0.2em] mt-1">PERMANENT DELEGATE ONLY</p>
                        </div>
                    </div>
                    <Settings2 className="w-6 h-6 text-white/10" />
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <input
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium text-white outline-none focus:border-red-500/20 tracking-tight placeholder:text-white/20 font-mono"
                            placeholder="Target Wallet Address"
                        />
                        <input
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium text-white outline-none focus:border-red-500/20 tracking-tight placeholder:text-white/20 font-mono"
                            placeholder="Amount to burn (LXR)"
                        />
                    </div>
                    <div className="md:w-64 flex flex-col gap-4">
                        <button className="w-full flex-1 bg-red-500/10 border border-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-500 rounded-3xl p-6 flex items-center justify-center gap-4 group">
                            <Flame className="w-6 h-6 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest">Execute Force Burn</span>
                        </button>
                        <button
                            onClick={() => fetchSecurityState()}
                            className="w-full py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] text-white/40 flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-medium"
                        >
                            <RefreshCw size={12} className={cn(status === 'loading' && "animate-spin")} />
                            Sync Security State
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Recovery */}
            <div className="p-10 border border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center border border-[#1a73e8]/20">
                            <Fingerprint className="w-6 h-6 text-[#1a73e8]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Social Recovery</h3>
                            <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] mt-1">IDENTITY & ASSET RECOVERY</p>
                        </div>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-[#1a73e8] animate-pulse" />
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-[#1a73e8]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white font-medium">Link Legal Identity</p>
                            <p className="text-[11px] text-white/40 mt-1 leading-relaxed">Connect specialized KYC-Cluster for biometric recovery authorization.</p>
                        </div>
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all">
                            Connect
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3">
                            <Lock className="w-4 h-4" />
                            Freeze Asset
                        </button>
                        <button className="p-4 bg-[#1a73e8] rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#1557b0] transition-all flex items-center justify-center gap-3">
                            <Unlock className="w-4 h-4" />
                            Start Recovery
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
