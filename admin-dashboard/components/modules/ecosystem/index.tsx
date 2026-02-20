"use client";

import React, { useState } from "react";
import { Globe, ShieldCheck, Link as LinkIcon, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../shared/index";
import { PriceFeed } from "./PriceFeed";
import { SquadsIntegration } from "./SquadsIntegration";

const TABS = [
    { id: "market", label: "Market Overview", icon: Globe },
    { id: "multisig", label: "Multisig Control", icon: ShieldCheck },
    { id: "resources", label: "Resource Hub", icon: LinkIcon },
];

export default function EcosystemModule() {
    const [activeTab, setActiveTab] = useState("market");

    return (
        <div className="w-full space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tight">Ecosystem Hub</h1>
                    <p className="text-sm text-white/40 mt-2">External integrations and secondary market metrics</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-medium transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                            )}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "market" && (
                        <div className="space-y-12">
                            <PriceFeed />
                            {/* Additional market charts could go here */}
                        </div>
                    )}

                    {activeTab === "multisig" && <SquadsIntegration />}

                    {activeTab === "resources" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: "Jupiter", url: "https://jup.ag", desc: "DEX Aggregator" },
                                { name: "Birdeye", url: "https://birdeye.so", desc: "Data Analytics" },
                                { name: "Squads", url: "https://v4.squads.so", desc: "Multisig App" },
                                { name: "Solana Explorer", url: "https://explorer.solana.com", desc: "Blockchain Explorer" }
                            ].map((res) => (
                                <a
                                    key={res.name}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all"
                                >
                                    <h4 className="text-lg font-medium text-white mb-1">{res.name}</h4>
                                    <p className="text-xs text-white/40 mb-4">{res.desc}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Visit Platform <ExternalLink size={10} />
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
