'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, use } from 'react';
import { useEnv } from "@/components/providers/EnvProvider";
import {
    PlaceholderModule, SupplyModule, InflationModule, StakingModule,
    ContractFactoryModule, AnalyticsModule,
    AdvancedEconomyModule, SecurityModule, LiquidityAdvancedModule, HardwareModule,
    SwapModule, FleetTransferModule, GovernanceModule, EcosystemModule
} from "@/components/modules";
import {
    Activity, ShieldAlert, TrendingUp, Database, Coins, Cpu, Zap, Factory, BarChart3, RefreshCw, Send, ShieldCheck,
    LayoutDashboard, Calendar, Settings, FileText, Code, Users, PieChart, Landmark, Bot, Server, Power, Flame, ChevronLeft,
    Globe, Link as LinkIcon
} from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import InnerSidebar from "@/components/layout/InnerSidebar";

const moduleSchemas: Record<string, { label: string, icon: any, color: string, subTopics: { id: string, label: string, icon?: any }[] }> = {
    "advanced-economy": {
        label: "Economy",
        icon: TrendingUp,
        color: "blue",
        subTopics: [
            { id: "vesting", label: "Vesting Schedules", icon: Calendar },
            { id: "rebase", label: "Rebase Control", icon: RefreshCw },
            { id: "minting", label: "Multi-Mint Auth", icon: Zap }
        ]
    },
    "security-god-mode": {
        label: "God Mode",
        icon: ShieldAlert,
        color: "rose",
        subTopics: [
            { id: "hooks", label: "Transfer Hooks", icon: Activity },
            { id: "recovery", label: "Social Recovery", icon: ShieldCheck },
            { id: "burn", label: "Force-Burn", icon: Flame }
        ]
    },
    "supply": {
        label: "Supply",
        icon: Activity,
        color: "emerald",
        subTopics: [
            { id: "circulation", label: "Circulación", icon: Activity },
            { id: "emissions", label: "Emisiones", icon: Zap },
            { id: "burn-history", label: "Historial Quema", icon: Flame }
        ]
    },
    "staking": {
        label: "Staking",
        icon: Database,
        color: "purple",
        subTopics: [
            { id: "pools", label: "Pools Activas", icon: Database },
            { id: "yield", label: "Rendimientos", icon: TrendingUp },
            { id: "tiers", label: "Staking Tiers", icon: Layers }
        ]
    },
    "liquidity-reserves": {
        label: "Liquidity",
        icon: Coins,
        color: "amber",
        subTopics: [
            { id: "treasury", label: "Tesorería", icon: PieChart },
            { id: "arbitrage", label: "Bot Arbitraje", icon: Bot },
            { id: "reserves", label: "Reservas", icon: Landmark }
        ]
    },
    "hardware-integration": {
        label: "Hardware",
        icon: Cpu,
        color: "slate",
        subTopics: [
            { id: "fleet", label: "Gestión Fleet", icon: Server },
            { id: "kill-switch", label: "Kill-Switch", icon: Power },
            { id: "firmware", label: "Firmware Sync", icon: RefreshCw }
        ]
    },
    "inflation": {
        label: "Inflation",
        icon: Zap,
        color: "yellow",
        subTopics: [
            { id: "trigger", label: "Trigger Policy", icon: Zap },
            { id: "params", label: "Parámetros", icon: Settings }
        ]
    },
    "contract-factory": {
        label: "Factory",
        icon: Factory,
        color: "indigo",
        subTopics: [
            { id: "deploy", label: "Desplegar", icon: Code },
            { id: "templates", label: "Plantillas", icon: FileText }
        ]
    },
    "analytics": {
        label: "Metrics",
        icon: BarChart3,
        color: "cyan",
        subTopics: [
            { id: "on-chain", label: "On-chain Data", icon: Database },
            { id: "market", label: "Mercado", icon: BarChart3 },
            { id: "holders", label: "Holders", icon: Users }
        ]
    },
    "swap-convert": {
        label: "Exchange",
        icon: RefreshCw,
        color: "emerald",
        subTopics: [
            { id: "convert", label: "Convertir", icon: RefreshCw },
            { id: "buy", label: "Comprar", icon: Coins },
            { id: "sell", label: "Vender", icon: Activity }
        ]
    },
    "fleet-transfer": {
        label: "Transfers",
        icon: Send,
        color: "blue",
        subTopics: [
            { id: "fleet-engine", label: "Fleet Engine", icon: Server },
            { id: "displacement", label: "Displacement", icon: Send }
        ]
    },
    "governance": {
        label: "Governance",
        icon: ShieldCheck,
        color: "slate",
        subTopics: [
            { id: "emergency", label: "Protocol Pause", icon: Power },
            { id: "operators", label: "Operator Roles", icon: Users },
            { id: "vaults", label: "Vault Config", icon: Landmark }
        ]
    },
    "ecosystem": {
        label: "Ecosystem",
        icon: Globe,
        color: "blue",
        subTopics: [
            { id: "prices", label: "Live Prices", icon: TrendingUp },
            { id: "squads", label: "Multisig Control", icon: ShieldCheck },
            { id: "resources", label: "Resource Hub", icon: LinkIcon }
        ]
    }
};

function Layers(props: any) {
    return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a1 1 0 0 0 0 1.83l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a1 1 0 0 0 0-1.83Z" /><path d="m2.6 11.27 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09" /><path d="m2.6 16.27 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09" /></svg>
}

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { config } = useEnv();
    const [activeSubTopic, setActiveSubTopic] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (moduleSchemas[id]) {
            setActiveSubTopic(moduleSchemas[id].subTopics[0].id);
        }
    }, [id]);

    const renderModuleContent = () => {
        switch (id) {
            case "advanced-economy": return <AdvancedEconomyModule />;
            case "security-god-mode": return <SecurityModule />;
            case "liquidity-reserves": return <LiquidityAdvancedModule />;
            case "hardware-integration": return <HardwareModule />;
            case "analytics": return <AnalyticsModule />;
            case "supply": return <SupplyModule />;
            case "inflation": return <InflationModule />;
            case "staking": return <StakingModule />;
            case "contract-factory": return <ContractFactoryModule />;
            case "swap-convert": return <SwapModule />;
            case "fleet-transfer": return <FleetTransferModule />;
            case "governance": return <GovernanceModule />;
            case "ecosystem": return <EcosystemModule />;
            default:
                const mod = moduleSchemas[id];
                return (
                    <PlaceholderModule
                        title={mod?.label || "Protocol Module"}
                        description={`Advanced interface for ${mod?.label || "autonomous"} management.`}
                        icon={mod?.icon || Activity}
                        manual={[
                            "Select a subtopic on the left sidebar for deep metrics.",
                            "All changes are recorded as on-chain autonomous events.",
                            "Multi-sig authorization required for critical changes."
                        ]}
                    />
                );
        }
    };

    const currentSchema = moduleSchemas[id];

    if (!mounted) return null;

    const REDESIGNED_MODULES = ["supply", "staking", "governance", "security-god-mode", "advanced-economy", "fleet-transfer", "analytics", "ecosystem"];
    const isRedesigned = REDESIGNED_MODULES.includes(id);

    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col selection:bg-blue-500/20 antialiased overflow-hidden">
            {/* Header: Pure Premium - Hidden for Redesigned Modules */}
            {!isRedesigned && (
                <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050507]/60 backdrop-blur-3xl">
                    <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link
                                href="/"
                                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                            >
                                <ChevronLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                            </Link>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black tracking-tighter text-white">{currentSchema?.label || id}</h1>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-white tracking-[0.2em]">Autonomous Protocol Module</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <div className="h-[1px] w-12 bg-white/10" />
                            <span className="text-[10px] font-black text-white tracking-widest uppercase">Environment: {config.name} Network</span>
                        </div>
                    </div>
                </header>
            )}

            <main className="flex-1 w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
                {isRedesigned ? (
                    // Full Width Layout for Redesigned Modules
                    <div className="w-full h-full">
                        {renderModuleContent()}
                    </div>
                ) : (
                    // Legacy Layout with Sidebar
                    <div className="max-w-[1600px] mx-auto p-6 md:p-12">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            {currentSchema && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="w-full md:w-72 sticky top-0"
                                >
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl">
                                        <InnerSidebar
                                            title={currentSchema.label}
                                            subTopics={currentSchema.subTopics}
                                            activeSubTopic={activeSubTopic}
                                            onSubTopicChange={setActiveSubTopic}
                                        />
                                    </div>
                                </motion.div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex-1 min-w-0"
                            >
                                <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative z-10 p-4 md:p-8">
                                        {renderModuleContent()}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
