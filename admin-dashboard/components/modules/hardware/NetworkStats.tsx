
import React from "react";
import { ShieldAlert, Signal, HardDrive, Zap } from "lucide-react";

export const NetworkStats = () => {
    return (
        <div className="tech-card p-8 md:col-span-2 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "Hardware Auth", val: "Enforced", icon: ShieldAlert },
                    { label: "Fleet Uptime", val: "99.98%", icon: Signal },
                    { label: "Data Integrity", val: "Verified", icon: HardDrive },
                    { label: "Active PSA", val: "Global", icon: Zap }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <stat.icon className="w-6 h-6 text-[#1a73e8]/40 mb-3" />
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium mb-1">{stat.label}</span>
                        <span className="text-lg font-medium text-white tracking-tight">{stat.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
