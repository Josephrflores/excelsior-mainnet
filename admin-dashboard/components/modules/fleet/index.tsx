
"use client";

import React, { useState, useEffect } from "react";
import {
    Zap, Coins, Activity, RefreshCw,
    LayoutDashboard, History, ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import { cn, useProtocol } from "../shared/index";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { motion, AnimatePresence } from "framer-motion";

// Import extracted components and constants
import { FleetOverview } from "./FleetOverview";
import { TransferView } from "./TransferView";
import { DisplacementLogs } from "./DisplacementLogs";
import { FLIGHT_WALLETS } from "./constants";

export const FleetTransferModule = () => {
    const { wallet, config: envConfig, connection } = useProtocol();
    const [activeTab, setActiveTab] = useState<"dashboard" | "sol" | "lxr" | "xls" | "usdx" | "history">("dashboard");

    // Global State for all views
    const [balances, setBalances] = useState<Record<string, { sol: number, lxr: number, xls: number, usdx: number }>>({});
    const [isFetchingBalances, setIsFetchingBalances] = useState(false);

    // Fetch Balances Logic
    const fetchBalances = async () => {
        if (!FLIGHT_WALLETS.length || !connection) return;
        setIsFetchingBalances(true);
        try {
            const newBalances: Record<string, any> = {};
            // optimized batching could go here, for now linear or small batch
            const targets = FLIGHT_WALLETS.map(w => w.address);

            await Promise.all(targets.map(async (address) => {
                try {
                    const pubkey = new PublicKey(address);
                    const sol = await connection.getBalance(pubkey);

                    let lxr = 0;
                    try {
                        const ata = getAssociatedTokenAddressSync(envConfig.lxrMint, pubkey, true, TOKEN_2022_PROGRAM_ID);
                        const bal = await connection.getTokenAccountBalance(ata);
                        lxr = bal.value.uiAmount || 0;
                    } catch (e) { }

                    let xls = 0;
                    try {
                        const ata = getAssociatedTokenAddressSync(envConfig.xlsMint, pubkey, true, TOKEN_2022_PROGRAM_ID);
                        const bal = await connection.getTokenAccountBalance(ata);
                        xls = bal.value.uiAmount || 0;
                    } catch (e) { }

                    let usdx = 0;
                    try {
                        const ata = getAssociatedTokenAddressSync(envConfig.usdxMint, pubkey, true, TOKEN_2022_PROGRAM_ID);
                        const bal = await connection.getTokenAccountBalance(ata);
                        usdx = bal.value.uiAmount || 0;
                    } catch (e) { }

                    newBalances[address] = { sol: sol / LAMPORTS_PER_SOL, lxr, xls, usdx };
                } catch (e) { }
            }));

            setBalances(prev => ({ ...prev, ...newBalances }));
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            setIsFetchingBalances(false);
        }
    };

    useEffect(() => {
        fetchBalances();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection, envConfig]); // Re-fetch on env change

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
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white tracking-[0.2em]">FLEET NETWORK</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Transfers</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">Asset Displacement</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="dashboard" label="Overview" icon={LayoutDashboard} />
                        <div className="h-4" />
                        <SidebarItem id="sol" label="SOL Bridge" icon={Zap} />
                        <SidebarItem id="lxr" label="LXR Bridge" icon={Coins} />
                        <SidebarItem id="xls" label="XLS Bridge" icon={Activity} />
                        <SidebarItem id="usdx" label="USDX Bridge" icon={RefreshCw} />
                        <div className="h-4" />
                        <SidebarItem id="history" label="Displacement Logs" icon={History} />
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
                    {/* DASHBOARD VIEW */}
                    {activeTab === 'dashboard' && (
                        <FleetOverview
                            key="dashboard"
                            balances={balances}
                            isFetchingBalances={isFetchingBalances}
                            fetchBalances={fetchBalances}
                            setActiveTab={setActiveTab}
                        />
                    )}

                    {/* BRIDGE VIEWS */}
                    {(activeTab === 'sol' || activeTab === 'lxr' || activeTab === 'xls' || activeTab === 'usdx') && (
                        <TransferView
                            key={activeTab} // Add key to force re-render when tab changes
                            lockedAssetId={activeTab}
                            balances={balances}
                            fetchBalances={fetchBalances}
                        />
                    )}

                    {/* HISTORY VIEW */}
                    {activeTab === 'history' && (
                        <DisplacementLogs key="history" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FleetTransferModule;
