
"use client";

import React, { useState } from "react";
import {
    LayoutDashboard,
    Scale,
    BadgeDollarSign,
    Activity,
    ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import { useProtocol, cn } from "../shared/index";
import { AnimatePresence } from "framer-motion";

// Import extracted components
import { EconomicOverview } from "./EconomicOverview";
import { MonetaryPolicy } from "./MonetaryPolicy";
import { USDXStablecoin } from "./USDXStablecoin";
import { LiquidityManagement } from "./LiquidityManagement";
import { VestingManagement } from "./VestingManagement";

export const AdvancedEconomyModule = () => {
    const { status, setStatus, message, setMessage, getProgram, wallet, config: envConfig } = useProtocol();
    const [activeTab, setActiveTab] = useState<"dashboard" | "policy" | "usdx" | "liquidity" | "vesting">("dashboard");

    const SidebarItem = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative",
                activeTab === id ? "text-white" : "text-white/40 hover:text-white"
            )}
        >
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 bg-white transition-opacity duration-300",
                activeTab === id ? "opacity-100" : "opacity-0"
            )} />
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium tracking-tight text-left">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full min-h-[80vh] w-full animate-in fade-in duration-700">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col justify-between shrink-0 bg-[#050507]">
                <div>
                    <div className="px-8 pt-12 pb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white tracking-[0.2em]">CENTRAL BANK</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Economy</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">Monetary Policy & Stablecoin</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                        <div className="h-4" />
                        <SidebarItem id="policy" label="LXR Policy" icon={Scale} />
                        <SidebarItem id="usdx" label="USDX Stablecoin" icon={BadgeDollarSign} />
                        <SidebarItem id="liquidity" label="Liquidity & AMM" icon={Activity} />
                        <SidebarItem id="vesting" label="Vesting Vaults" icon={BadgeDollarSign} />
                    </div>
                </div>

                <div className="p-8">
                    <Link
                        href="/"
                        className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group"
                    >
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium tracking-wide">Return to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <EconomicOverview key="dashboard" />
                    )}

                    {activeTab === 'policy' && (
                        <MonetaryPolicy key="policy" />
                    )}

                    {activeTab === 'usdx' && (
                        <USDXStablecoin key="usdx" />
                    )}

                    {activeTab === 'liquidity' && (
                        <LiquidityManagement key="liquidity" />
                    )}

                    {activeTab === 'vesting' && (
                        <VestingManagement key="vesting" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
