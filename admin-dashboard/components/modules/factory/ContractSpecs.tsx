
import React from "react";
import { Info, Shield } from "lucide-react";

export const ContractSpecs = () => {
    return (
        <div className="space-y-12">
            <div className="tech-card p-12 space-y-8">
                <div className="flex items-center gap-4 mb-4">
                    <Info className="w-5 h-5 text-white/40" />
                    <h4 className="text-sm font-medium text-white tracking-tight">Technical specs</h4>
                </div>
                <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                        <span className="text-[10px] text-white/10 font-normal pt-1">01</span>
                        <p className="text-[11px] text-white/40 font-medium tracking-tight leading-relaxed">
                            Estimated deployment cost: 0.025 sol including meta-storage.
                        </p>
                    </li>
                    <li className="flex gap-4 items-start">
                        <span className="text-[10px] text-white/10 font-normal pt-1">02</span>
                        <p className="text-[11px] text-white/40 font-medium tracking-tight leading-relaxed">
                            Auto-config: mint & freeze extensions enabled by default.
                        </p>
                    </li>
                </ul>
            </div>

            <div className="tech-card p-8 flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Shield className="w-6 h-6 text-white/60" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-white tracking-tight">Active audit</h4>
                    <p className="text-white/20 text-[10px] font-medium tracking-tight mt-1">Real-time contract verification system</p>
                </div>
            </div>
        </div>
    );
};
