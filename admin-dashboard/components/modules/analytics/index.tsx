
"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart3, Users, ChevronLeft, Database
} from "lucide-react";
import Link from 'next/link';
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { useProtocol, cn } from "../shared/index";
import { AnimatePresence } from "framer-motion";

// Import extracted components
import { ProtocolStats } from "./ProtocolStats";
import { TokenEconomy } from "./TokenEconomy";
import { HoldersList } from "./HoldersList";

export const AnalyticsModule = () => {
    const { connection, config } = useProtocol();
    const [activeTab, setActiveTab] = useState<"on-chain" | "market" | "holders">("on-chain");
    const [stats, setStats] = useState({
        lxrSupply: 0,
        xlsSupply: 0,
        lxrTreasury: 0,
        xlsTreasury: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const lxrSupplyInfo = await connection.getTokenSupply(config.lxrMint);
            const xlsSupplyInfo = await connection.getTokenSupply(config.xlsMint);
            const adminLxrAta = getAssociatedTokenAddressSync(config.lxrMint, new PublicKey(config.adminAddress), false, TOKEN_2022_PROGRAM_ID);
            const adminXlsAta = getAssociatedTokenAddressSync(config.xlsMint, new PublicKey(config.adminAddress), false, TOKEN_2022_PROGRAM_ID);

            let lxrTreasury = 0;
            let xlsTreasury = 0;
            try {
                const lxrAcc = await getAccount(connection, adminLxrAta, "confirmed", TOKEN_2022_PROGRAM_ID);
                lxrTreasury = Number(lxrAcc.amount) / 1e9;
            } catch (e) { }
            try {
                const xlsAcc = await getAccount(connection, adminXlsAta, "confirmed", TOKEN_2022_PROGRAM_ID);
                xlsTreasury = Number(xlsAcc.amount) / 1e9;
            } catch (e) { }

            setStats({
                lxrSupply: lxrSupplyInfo.value.uiAmount || 0,
                xlsSupply: xlsSupplyInfo.value.uiAmount || 0,
                lxrTreasury,
                xlsTreasury,
            });
        } catch (e) {
            console.error("Error fetching analytics data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, 60000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection]);

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
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white tracking-[0.2em]">DATA SCIENCE</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Metrics</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">On-chain Analytics</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="on-chain" label="Protocol Stats" icon={Database} />
                        <SidebarItem id="market" label="Tokenomics" icon={BarChart3} />
                        <SidebarItem id="holders" label="Holders" icon={Users} />
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
                    {activeTab === 'on-chain' && (
                        <ProtocolStats key="on-chain" stats={stats} loading={loading} />
                    )}

                    {activeTab === 'market' && (
                        <TokenEconomy key="market" />
                    )}

                    {activeTab === 'holders' && (
                        <HoldersList key="holders" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
