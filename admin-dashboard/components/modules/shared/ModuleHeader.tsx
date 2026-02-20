
import React from "react";
import { LucideIcon } from "lucide-react";

export const ModuleHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon: LucideIcon }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex items-center gap-8 group">
            <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all duration-500 shadow-2xl">
                <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">{title}</h1>
                <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mt-2">{subtitle}</p>
            </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-white/60">SYSTEMS SYNCED</span>
        </div>
    </div>
);
