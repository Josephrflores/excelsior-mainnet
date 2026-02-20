
import React from "react";
import { PieChart, Activity, Wallet } from "lucide-react";

export const TreasuryBreakdown = () => {
    return (
        <div className="lg:col-span-2 tech-card p-8 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium text-white flex items-center gap-3">
                    <PieChart className="w-5 h-5 text-[#1a73e8]" />
                    Treasury breakdown
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-[#1a73e8]" />
                        <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Health: Optimal</span>
                    </div>
                    <Wallet className="w-5 h-5 text-white/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "SOL Reserves", value: "4,250.00", sub: "$510.4K", p: "45%" },
                    { label: "USDC Stable", value: "850,000.00", sub: "$850.0K", p: "35%" },
                    { label: "RWA Backing", value: "1,200,000.00", sub: "$1.2M", p: "20%" }
                ].map((asset, idx) => (
                    <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                        <p className="text-[10px] text-white/40 font-medium tracking-widest mb-1 uppercase">{asset.label}</p>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xl font-medium text-white tabular-nums">{asset.value}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-white/20">{asset.sub}</span>
                            <span className="text-[#1a73e8] font-medium">{asset.p}</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                            <div
                                className="bg-[#1a73e8] h-full transition-all duration-1000"
                                style={{ width: asset.p }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
