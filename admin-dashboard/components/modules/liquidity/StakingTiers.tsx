
import React from "react";
import { Layers, GanttChartSquare, Zap } from "lucide-react";

export const StakingTiers = () => {
    return (
        <div className="lg:col-span-3 tech-card p-8 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium text-white flex items-center gap-3">
                    <Layers className="w-5 h-5 text-[#1a73e8]" />
                    Stake multiplier tiers
                </h3>
                <GanttChartSquare className="w-5 h-5 text-white/20" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { name: "Silver", limit: "> 1,000", mult: "1.0x", color: "text-slate-400" },
                    { name: "Gold", limit: "> 5,000", mult: "1.2x", color: "text-amber-400" },
                    { name: "Platinum", limit: "> 10,000", mult: "1.5x", color: "text-[#1a73e8]" },
                    { name: "Diamond", limit: "> 50,000", mult: "2.0x", color: "text-white" }
                ].map((tier, id) => (
                    <div key={id} className="relative p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-12 h-12" />
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-medium mb-1 ${tier.color}`}>{tier.name}</span>
                        <span className="text-2xl font-medium text-white mb-4 tracking-tighter">{tier.mult}</span>
                        <span className="text-[10px] text-white/40 font-medium">{tier.limit} LXR</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
