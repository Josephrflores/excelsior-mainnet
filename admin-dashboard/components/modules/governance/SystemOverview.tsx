
import React from "react";
import { Activity, Users, RefreshCw, Factory, Clock, Zap, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FeeController } from "../security/FeeController";
import { cn } from "../shared/index";

interface SystemOverviewProps {
    accessControl: any;
    config: any;
    fetchGovernanceState: () => void;
}

export const SystemOverview = ({ accessControl, config, fetchGovernanceState }: SystemOverviewProps) => {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 w-full"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-white tracking-tight">System Overview</h1>
                <div className={cn(
                    "px-4 py-2 rounded-full border flex items-center gap-3 transition-all duration-500",
                    accessControl?.paused
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : "bg-[#1a73e8]/10 border-[#1a73e8]/20 text-[#1a73e8]"
                )}>
                    <Activity className={cn("w-4 h-4", accessControl?.paused ? "" : "animate-pulse")} />
                    <span className="text-[10px] font-black tracking-[0.2em]">
                        {accessControl?.paused ? "PROTOCOL PAUSED" : "OPERATIONAL"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">ACTIVE OPERATORS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{accessControl?.operators?.length || 0}</h3>
                        <span className="text-xs text-white/40">Entities</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-medium">
                        <Users className="w-3 h-3" />
                        <span>Authentication Active</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">FEE BASIS POINTS</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{config?.feeBasisPoints || 0}</h3>
                        <span className="text-xs text-white/40">BPS</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-medium">
                        <RefreshCw className="w-3 h-3" />
                        <span>Max: {config?.maxFeeBasisPoints || 500}</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">MODULES ACTIVE</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">
                            {((config?.moduleFlags & 1) ? 1 : 0) + ((config?.moduleFlags & 2) ? 1 : 0)}
                        </h3>
                        <span className="text-xs text-white/40">/ 2</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-purple-400 text-[10px] font-medium">
                        <Factory className="w-3 h-3" />
                        <span>Sub-systems live</span>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-white/40 text-xs font-medium tracking-widest mb-4">ORACLE THRESHOLD</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl text-white font-light tracking-tighter">{config?.oracleStalenessThreshold?.toNumber() || 0}</h3>
                        <span className="text-xs text-white/40">Secs</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-[10px] font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Staleness Limit</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FeeController
                    currentFee={config?.feeBasisPoints || 0}
                    maxFee={config?.maxFeeBasisPoints || 500}
                    onUpdate={fetchGovernanceState}
                />

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Monetary Policy</h3>
                            <p className="text-xs text-white/40">Inflation & Distribution</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                            <span className="text-[11px] text-white font-medium tracking-widest uppercase">Inflation Epoch</span>
                            <span className="text-sm font-mono text-white">Every 5 years</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                            <span className="text-[11px] text-white font-medium tracking-widest uppercase">Last Distribution</span>
                            <span className="text-sm font-mono text-white">
                                {config?.lastInflationTimestamp
                                    ? new Date(config.lastInflationTimestamp.toNumber() * 1000).toLocaleDateString()
                                    : "No Data"}
                            </span>
                        </div>
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] text-amber-500 font-medium tracking-wide">Policy adjustments require DAO vote</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
