
import React, { useState } from "react";
import { Bot, Activity, ArrowUpRight } from "lucide-react";

export const PegOptimizer = () => {
    const [botActive, setBotActive] = useState(true);

    return (
        <div className="tech-card p-8 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium text-white flex items-center gap-3">
                    <Bot className="w-5 h-5 text-[#1a73e8]" />
                    Peg optimizer
                </h3>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${botActive ? 'bg-[#1a73e8]/10 active-glow' : 'bg-white/5'}`}>
                    <Activity className={`w-5 h-5 ${botActive ? 'text-[#1a73e8]' : 'text-white/20'}`} />
                </div>
            </div>

            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="text-[10px] text-white/20 tracking-widest mb-2 font-medium">LUXOR / EXCELSIOR PRICE</div>
                    <div className="text-3xl font-medium text-white tabular-nums tracking-tighter">0.9984</div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-red-500 mt-1 font-medium">
                        <ArrowUpRight className="w-3 h-3 rotate-180" />
                        -0.16% dev
                    </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-white/60">Bot execution</span>
                        <span className={`text-[10px] font-medium ${botActive ? 'text-[#1a73e8]' : 'text-white/20'}`}>
                            {botActive ? 'ON' : 'OFF'}
                        </span>
                    </div>
                    <button
                        onClick={() => setBotActive(!botActive)}
                        className={`w-full py-3 rounded-full text-[11px] font-medium transition-all ${botActive ? 'border border-[#1a73e8]/30 text-[#1a73e8]' : 'bg-[#1a73e8] text-white'}`}
                    >
                        {botActive ? 'Deactivate Bot' : 'Activate Bot'}
                    </button>
                </div>
            </div>
        </div>
    );
};
