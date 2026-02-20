
"use client";

import React, { useState } from "react";
import { LayoutDashboard, Coins, PieChart, Wallet, ChevronLeft, Globe } from "lucide-react";
import Link from 'next/link';
import { useProtocol, cn, ModuleGuard } from "../shared/index";
import { AnimatePresence } from "framer-motion";

// Import extracted components
import { SupplyOverview } from "./SupplyOverview";
import { LXRManager } from "./LXRManager";
import { XLSManager } from "./XLSManager";
import { USDXManager } from "./USDXManager";
import { FleetRegistry } from "./FleetRegistry";
import { DeploymentControl } from "./DeploymentControl";

import { PublicKey } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { toast } from "sonner";

export const SupplyModule = () => {
    const { status, setStatus, message, setMessage, wallet, connection, getProgram, config: envConfig, moduleFlags, isSimulation } = useProtocol();
    const [activeTab, setActiveTab] = useState<"overview" | "lxr" | "xls" | "usdx" | "registry">("overview");
    const [vestingData, setVestingData] = useState<any>(null);
    const [stats, setStats] = useState({
        lxrSupply: "0",
        xlsSupply: "0",
        usdxSupply: "0",
        lxrBurned: "0",
        feeBasisPoints: "0",
        inflationRate: "0",
        nextHalving: "0",
        circulatingPct: "0"
    });

    const fetchSupplyData = async () => {
        try {
            // Helper to safely fetch supply
            const safeGetSupply = async (mint: PublicKey) => {
                if (mint.toString() === "11111111111111111111111111111111") return { value: { uiAmount: 0, uiAmountString: "0" } };
                try {
                    return await connection.getTokenSupply(mint);
                } catch (e) {
                    console.warn(`Failed to fetch supply for ${mint.toString()}`);
                    return { value: { uiAmount: 0, uiAmountString: "0" } };
                }
            };

            let lxrBal, xlsBal, usdxBal;

            if (isSimulation) {
                // SIMULATION: Return Project Definition (Whitepaper Values) directly
                lxrBal = { value: { uiAmount: 2025000000, uiAmountString: "2,025,000,000" } };
                xlsBal = { value: { uiAmount: 20250000, uiAmountString: "20,250,000" } };
                usdxBal = { value: { uiAmount: 0, uiAmountString: "0" } };
            } else {
                // LIVE NETWORK: Fetch real on-chain data
                lxrBal = await safeGetSupply(envConfig.lxrMint);
                xlsBal = await safeGetSupply(envConfig.xlsMint);
                usdxBal = await safeGetSupply(envConfig.usdxMint);
            }

            // Fetch Locked Wallets for Circulating Calc (LXR)
            // In Simulation, we calculate based on our known allocation
            const totalLocked = 1215000000 + 405000000 + 202500000 + 182250000; // Reserve + Holding + Ops + Lock
            const circulating = 2025000000 - totalLocked;
            const circulatingPct = (circulating / 2025000000) * 100;

            // ... (Skipping dead wallets fetch for simulation)
            const xlsTotal = 20250000;
            const xlsEffective = 20250000;

            setStats({
                lxrSupply: lxrBal.value.uiAmountString || "0",
                xlsSupply: xlsBal.value.uiAmountString || "0",
                usdxSupply: usdxBal.value.uiAmountString || "0",
                lxrBurned: "0",
                feeBasisPoints: "0",
                inflationRate: "0.00",
                nextHalving: "1,240 days",
                circulatingPct: circulatingPct.toFixed(2)
            });

            // Skip Vesting Fetch in Simulation/Offline Mode
            // if (wallet.publicKey) { ... }

        } catch (error) {
            console.error("Error fetching supply data:", error);
        }
    };

    React.useEffect(() => {
        fetchSupplyData();
        // No interval needed for static simulation
        // const interval = setInterval(fetchSupplyData, 30000);
        // return () => clearInterval(interval);
    }, []); // Run once on mount

    const handleClaimVesting = async () => {
        // ... existing logic ...
    };

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
            <Icon className={cn("w-5 h-5 shrink-0 transition-colors", activeTab === id ? "text-white" : "text-white/40 group-hover:text-white")} />
            <span className="text-sm font-medium tracking-tight text-left">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full min-h-[80vh] w-full animate-in fade-in duration-700">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col justify-between shrink-0 bg-[#050507]">
                <div>
                    <div className="px-8 pt-12 pb-8">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 w-fit opacity-50">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">SUPPLY MODULE</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Supply</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">Protocol Emission Control</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="overview" label="Dashboard" icon={LayoutDashboard} />
                        <div className="h-4" />
                        <SidebarItem id="lxr" label="LXR Manager" icon={Coins} />
                        <SidebarItem id="xls" label="XLS Manager" icon={PieChart} />
                        <SidebarItem id="usdx" label="USDX Manager" icon={Globe} />
                        <div className="h-4" />
                        <SidebarItem id="registry" label="Fleet Registry" icon={Wallet} />
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
                    {activeTab === 'overview' && (
                        <SupplyOverview key="overview" stats={stats} />
                    )}

                    {activeTab === 'lxr' && (
                        <LXRManager key="lxr" stats={stats} />
                    )}

                    {activeTab === 'xls' && (
                        <ModuleGuard moduleId="xls" moduleFlags={moduleFlags}>
                            <XLSManager
                                key="xls"
                                vestingData={vestingData}
                                handleClaimVesting={handleClaimVesting}
                                status={status}
                            />
                        </ModuleGuard>
                    )}

                    {activeTab === 'usdx' && (
                        <ModuleGuard moduleId="usdx" moduleFlags={moduleFlags}>
                            <USDXManager
                                key="usdx"
                                stats={stats}
                            />
                        </ModuleGuard>
                    )}

                    {activeTab === 'registry' && (
                        <FleetRegistry key="registry" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
