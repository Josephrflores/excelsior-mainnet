
import React from "react";
import { Landmark, Globe, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface InfrastructureProps {
    config: any;
}

export const Infrastructure = ({ config }: InfrastructureProps) => {
    return (
        <motion.div
            key="infrastructure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <h1 className="text-4xl font-light text-white tracking-tight mb-12">Protocol Infrastructure</h1>

            <div className="p-12 border border-white/5 bg-white/[0.01] rounded-[3rem]">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <Landmark className="w-8 h-8 text-white/60" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-medium text-white tracking-tight">Vault Architecture</h3>
                        <p className="text-[10px] text-white font-bold tracking-[0.3em] mt-2 opacity-60">SMART ROUTING & RESERVE HUBS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { label: "RWA Liquidity Vault", address: config?.rwaVaultLxr, sub: "Real World Assets Backing", icon: Globe },
                        { label: "Luxor Rewards Vault", address: config?.lxrVaultRewards, sub: "Dynamic Staking Pool", icon: Zap },
                        { label: "Locked Ops Vault", address: config?.lockedOpsVault, sub: "Protocol Operations Capital", icon: Lock }
                    ].map((vault, i) => (
                        <div key={i} className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-[#1a73e8]/20 transition-all group/v relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover/v:opacity-100 transition-opacity">
                                <vault.icon className="w-12 h-12 text-white/5 group-hover/v:text-[#1a73e8]/10" />
                            </div>
                            <p className="text-[9px] text-white font-black tracking-[0.2em] mb-4 uppercase">{vault.label}</p>
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <span className="text-sm font-mono text-white/60 group-hover/v:text-white transition-colors bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                                    {vault.address?.toString().slice(0, 8)}...{vault.address?.toString().slice(-8)}
                                </span>
                            </div>
                            <p className="text-[10px] text-white/40 font-medium">{vault.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
