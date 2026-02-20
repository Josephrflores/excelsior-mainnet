
"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    Activity,
    Landmark,
    Factory,
    ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import { useProtocol, cn } from "../shared/index";
import { PublicKey } from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";

// Import extracted components
import { SystemOverview } from "./SystemOverview";
import { AccessControl } from "./AccessControl";
import { ModuleSystem } from "./ModuleSystem";
import { Infrastructure } from "./Infrastructure";

export default function GovernanceModule() {
    const { getProgram } = useProtocol();
    const [config, setConfig] = useState<any>(null);
    const [accessControl, setAccessControl] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "controls" | "modules" | "infrastructure">("overview");

    const fetchGovernanceState = async () => {
        const program = getProgram();
        if (!program) return;

        try {
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("global_config")],
                program.programId
            );
            const [acPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("access_control")],
                program.programId
            );

            const configData = await (program.account as any).globalConfig.fetch(configPda);
            setConfig(configData);

            try {
                const acData = await (program.account as any).accessControl.fetch(acPda);
                setAccessControl(acData);
            } catch (e) {
                console.log("Access Control not initialized yet");
            }
        } catch (e) {
            console.error("Error fetching governance state:", e);
        }
    };

    useEffect(() => {
        fetchGovernanceState();
        const interval = setInterval(fetchGovernanceState, 10000);
        return () => clearInterval(interval);
    }, []);

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
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white tracking-[0.2em]">ADMIN CONSOLE</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Governance</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">Protocol Administration</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="overview" label="Overview" icon={Activity} />
                        <SidebarItem id="controls" label="Access Control" icon={ShieldCheck} />
                        <SidebarItem id="modules" label="Module System" icon={Factory} />
                        <SidebarItem id="infrastructure" label="Infrastructure" icon={Landmark} />
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
                        <SystemOverview
                            key="overview"
                            accessControl={accessControl}
                            config={config}
                            fetchGovernanceState={fetchGovernanceState}
                        />
                    )}

                    {activeTab === 'controls' && (
                        <AccessControl
                            key="controls"
                            accessControl={accessControl}
                            fetchGovernanceState={fetchGovernanceState}
                        />
                    )}

                    {activeTab === 'modules' && (
                        <ModuleSystem
                            key="modules"
                            config={config}
                            fetchGovernanceState={fetchGovernanceState}
                        />
                    )}

                    {activeTab === 'infrastructure' && (
                        <Infrastructure
                            key="infrastructure"
                            config={config}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
