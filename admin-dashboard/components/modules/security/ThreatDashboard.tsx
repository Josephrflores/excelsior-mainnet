
import React from "react";
import { ShieldCheck, Database, Activity, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface ThreatDashboardProps {
    feeActive: boolean;
    withdrawalRequests: any[];
    config: any;
}

export const ThreatDashboard = ({ feeActive, withdrawalRequests, config }: ThreatDashboardProps) => {
    return (
        <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 w-full"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-white tracking-tight">Threat Dashboard</h1>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-bold tracking-wide">SYSTEMS SECURE</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">ORACLE STATUS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">Active</h3>
                        <span className="text-xs text-white/40">Pyth + CL</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <Database className="w-3 h-3" />
                        <span>Feeds Synced</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">TRANSFER HOOK</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{feeActive ? "On" : "Off"}</h3>
                        <span className="text-xs text-white/40">Fee Logic</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-white/40 text-[10px] font-medium">
                        <Activity className="w-3 h-3" />
                        <span>Dynamic Defense</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">PENDING WITHDRAWALS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{withdrawalRequests.length}</h3>
                        <span className="text-xs text-white/40">Requests</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-[10px] font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Time-locked</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">MULTISIG QUORUM</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">3/5</h3>
                        <span className="text-xs text-white/40">Signers</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-purple-400 text-[10px] font-medium">
                        <Users className="w-3 h-3" />
                        <span>Squads V4</span>
                    </div>
                </div>
            </div>

            {/* Institutional Oracle Resilience */}
            <div className="tech-card p-10 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center border border-[#1a73e8]/20">
                            <Database className="w-6 h-6 text-[#1a73e8]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Oracle Resilience Hub</h3>
                            <p className="text-[10px] text-white/60 font-bold tracking-[0.2em] mt-1">3-LAYER FALLBACK HIERARCHY</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[
                        {
                            name: "Pyth Network",
                            type: "Primary",
                            active: config?.pythOracle?.toString() !== "11111111111111111111111111111111",
                            address: config?.pythOracle?.toString() || "Syncing...",
                            latency: "400ms"
                        },
                        {
                            name: "Chainlink",
                            type: "Secondary",
                            active: config?.chainlinkOracle?.toString() !== "11111111111111111111111111111111",
                            address: config?.chainlinkOracle?.toString() || "Syncing...",
                            latency: "1s"
                        },
                        {
                            name: "Circuit Breaker",
                            type: "Safety",
                            active: false,
                            address: "Protocol TWAP",
                            latency: "N/A"
                        },
                    ].map((oracle, i) => (
                        <div key={i} className={cn(
                            "p-6 rounded-3xl border transition-all group",
                            oracle.active ? "bg-[#1a73e8]/10 border-[#1a73e8]/30" : "bg-white/5 border-white/5"
                        )}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[9px] font-bold tracking-[0.2em] mb-1 opacity-60 text-white uppercase">{oracle.type}</p>
                                    <h4 className="text-sm font-medium text-white">{oracle.name}</h4>
                                </div>
                                <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]", oracle.active ? "bg-[#1a73e8] text-[#1a73e8]" : "bg-white/10 text-white/10")} />
                            </div>
                            <p className="text-[10px] text-white/30 truncate mb-4 font-mono">{oracle.address}</p>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-white/40">Latency</span>
                                <span className="text-white/60 font-medium">{oracle.latency}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
