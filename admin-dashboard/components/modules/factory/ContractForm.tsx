
import React from "react";
import { Rocket } from "lucide-react";

export const ContractForm = () => {
    return (
        <div className="tech-card p-12 space-y-12">
            <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-white/20 rounded-full" />
                <h3 className="text-xl font-medium text-white tracking-tight">
                    SPL-2022 deployment
                </h3>
            </div>

            <div className="space-y-8">
                <div className="space-y-4">
                    <p className="text-[11px] text-white/40 font-medium tracking-tight px-1">Resource name</p>
                    <input className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium text-white outline-none focus:border-white/20 tracking-tight" placeholder="e.g. Luxor Residential" />
                </div>
                <div className="space-y-4">
                    <p className="text-[11px] text-white/40 font-medium tracking-tight px-1">Ticker symbol</p>
                    <input className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium text-white outline-none focus:border-white/20 tracking-tight" placeholder="e.g. LXR-NYC" />
                </div>

                <button className="w-full py-5 bg-white text-black text-[11px] font-medium rounded-full hover:bg-white/90 transition-all flex items-center justify-center gap-4 shadow-xl">
                    <Rocket className="w-4 h-4" />
                    Initialize protocol
                </button>
            </div>
        </div>
    );
};
