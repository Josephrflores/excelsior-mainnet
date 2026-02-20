
import React from "react";

export const ManualSection = ({ title, steps }: { title: string, steps: string[] }) => (
    <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] mt-24">
        <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <h4 className="text-sm font-black tracking-[0.2em] uppercase text-white/60">Autonomous instructions</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
                <div key={idx} className="space-y-4">
                    <span className="text-[10px] font-black text-blue-500 tracking-tighter/50">0{idx + 1}</span>
                    <p className="text-[11px] text-white/40 leading-relaxed font-medium">{step}</p>
                </div>
            ))}
        </div>
    </div>
);
