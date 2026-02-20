"use client";

import React, { useState } from "react";
import {
    Database, Zap, Shield, BarChart3, Settings, Users,
    Activity, Lock, Cpu, Globe, Scale, Coins,
    Flame, Calendar, TrendingUp, Search, Bell,
    Link as LinkIcon, Server, ShieldAlert, FileText,
    UserCheck, Brain, Eye, HelpCircle, Code,
    HeartHandshake, Map, Share2, LayoutDashboard, ChevronRight
} from "lucide-react";
import WalletBalance from "../dashboard/WalletBalance";
import { useSession } from "next-auth/react";
import { useProtocol, cn } from "../modules/shared";

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
    badge?: string;
    category?: string;
    locked?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, locked }: SidebarItemProps) => (
    <button
        onClick={locked ? undefined : onClick}
        className={cn(
            "w-full flex items-center justify-between px-4 py-3 transition-all duration-300 group rounded-xl text-[11px] font-medium tracking-tight",
            active
                ? "bg-white/10 text-white shadow-lg border border-white/5"
                : "text-white/40 hover:bg-white/5 hover:text-white",
            locked && "opacity-40 cursor-not-allowed group-hover:bg-transparent"
        )}
    >
        <div className="flex items-center gap-3">
            <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", active ? "text-white" : "text-white/20 group-hover:text-white")} />
            <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {locked && <Lock className="w-3 h-3 text-white/20" />}
            {badge && (
                <span className={cn(
                    "px-2 py-0.5 text-[8px] font-medium rounded-full",
                    active ? "bg-white/20 text-white" : "bg-white/5 text-white/40 border border-white/5"
                )}>
                    {badge}
                </span>
            )}
        </div>
    </button>
);

const categories = [
    {
        name: "Economía & Suministro",
        items: [
            { id: "supply", label: "Protocol supply", icon: Coins, badge: "Live" },
            { id: "inflation", label: "Monetary policy", icon: Zap },
            { id: "staking", label: "Yield & staking", icon: Database },
            { id: "burn", label: "Burn analytics", icon: Flame },
            { id: "vesting", label: "Vesting schedule", icon: Calendar, moduleId: "xls" },
            { id: "insurance", label: "Insurance fund", icon: Shield },
            { id: "payroll", label: "Streaming payroll", icon: Activity },
        ]
    },
    {
        name: "Mercados & Liquidez",
        items: [
            { id: "liquidity", label: "Liquidity pools", icon: TrendingUp },
            { id: "market-maker", label: "Market maker", icon: BarChart3 },
            { id: "launch", label: "Mainnet launch", icon: Zap },
            { id: "oracles", label: "Oracle cluster", icon: Eye },
        ]
    },
    {
        name: "Gobernanza & Seguridad",
        items: [
            { id: "governance", label: "DAO treasury", icon: Lock, moduleId: "xls" },
            { id: "rbac", label: "Access control", icon: Users },
            { id: "dao", label: "DAO voting", icon: Globe, moduleId: "xls" },
            { id: "circuit-breaker", label: "Security breach", icon: ShieldAlert },
            { id: "audit", label: "Transaction audit", icon: FileText },
        ]
    },
    {
        name: "Partners & Connectors",
        items: [
            { id: "ecosystem", label: "Ecosystem Hub", icon: Globe, badge: "New" },
        ]
    }
];

export default function Sidebar({ activeModule, onModuleChange }: { activeModule: string, onModuleChange: (id: string) => void }) {
    const { data: session } = useSession();
    const { moduleFlags } = useProtocol();

    const isModuleLocked = (moduleId?: string) => {
        if (!moduleId) return false;
        const bit = moduleId === 'xls' ? 2 : (moduleId === 'usdx' ? 4 : 1);
        return (moduleFlags & bit) === 0;
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#050507]/60 backdrop-blur-3xl border-r border-white/5 flex flex-col h-screen overflow-hidden z-50">
            <div className="p-8 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-4 mb-14 px-2">
                    <div className="w-9 h-9 bg-white flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <Zap className="text-black w-5 h-5" />
                    </div>
                    <span className="text-xl font-medium tracking-tighter text-white">Excelsior</span>
                </div>

                <nav className="space-y-10 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Global overview"
                        active={activeModule === "overview"}
                        onClick={() => onModuleChange("overview")}
                    />

                    {categories.map((cat) => (
                        <div key={cat.name} className="space-y-3">
                            <h4 className="text-[10px] font-medium text-white/20 tracking-widest pl-4">
                                {cat.name}
                            </h4>
                            <div className="space-y-1">
                                {cat.items.map((item: any) => (
                                    <SidebarItem
                                        key={item.id}
                                        icon={item.icon}
                                        label={item.label}
                                        active={activeModule === item.id}
                                        onClick={() => onModuleChange(item.id)}
                                        badge={item.badge}
                                        locked={isModuleLocked(item.moduleId)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
// ...

            <div className="p-8 border-t border-white/5 bg-white/[0.02] space-y-8">
                <WalletBalance />

                <div className="flex items-center gap-4 px-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 bg-white/10 border border-white/10 flex items-center justify-center text-xs font-medium text-white rounded-xl">
                        {session?.user?.name?.substring(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-white tracking-tight">{session?.user?.name || "Administrator"}</span>
                        <span className="text-[9px] text-[#1a73e8] font-medium tracking-tight flex items-center gap-2">
                            <div className="w-1 h-1 bg-[#1a73e8] rounded-full active-glow" />
                            System active
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
