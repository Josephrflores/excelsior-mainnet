
import React, { useState } from "react";
import { ShieldAlert, Power, RefreshCcw, CheckCircle2 } from "lucide-react";

export const HardwareControls = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    return (
        <div className="flex flex-col gap-8">
            {/* Kill Switch */}
            <div className="tech-card p-8 border-red-500/10 bg-red-500/[0.02]">
                <h3 className="text-xl font-medium text-white flex items-center gap-3 mb-6">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Remote kill-switch
                </h3>
                <p className="text-[11px] text-white/40 font-medium mb-6 leading-relaxed">
                    Emergency protocol for compromised devices. Revokes all cryptographic authorities and wipes local validation rules.
                </p>
                <button className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-2xl text-[11px] font-medium uppercase tracking-widest flex items-center justify-center gap-3">
                    <Power className="w-4 h-4" />
                    Emergency shutdown
                </button>
            </div>

            {/* Firmware Sync */}
            <div className="tech-card p-8 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium text-white flex items-center gap-3">
                        <RefreshCcw className="w-5 h-5 text-[#1a73e8]" />
                        Firmware sync
                    </h3>
                    <CheckCircle2 className="w-5 h-5 text-[#1a73e8] blue-glow" />
                </div>

                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/60">Current Build</span>
                        <span className="text-white font-medium">v1.2.8-beta</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/60">Last Updated</span>
                        <span className="text-white/40">2h ago</span>
                    </div>

                    <button
                        onClick={() => {
                            setIsSyncing(true);
                            setTimeout(() => setIsSyncing(false), 2000);
                        }}
                        className="w-full btn-blue py-3 flex items-center justify-center gap-2 text-[11px]"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "Pushing updates..." : "Force sync all"}
                    </button>
                </div>
            </div>
        </div>
    );
};
