import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Book, Scroll, Database,
    X, Landmark, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-components
import { InventoryReport } from "./reports/InventoryReport";
import { ConstitutionReport } from "./reports/ConstitutionReport";
import { StrategyReport } from "./reports/StrategyReport";
import { GovernanceReport } from "./reports/GovernanceReport";

interface Tab {
    id: string;
    label: string;
    icon: any;
}

const tabs: Tab[] = [
    { id: "inventory", label: "Inventory", icon: Database },
    { id: "constitution", label: "Constitution", icon: Scroll },
    { id: "strategy", label: "Strategic Plan", icon: Activity },
    { id: "governance", label: "Governance", icon: Landmark },
];

export const ProjectReports = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState("inventory");

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 lg:p-12 font-sans">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full h-full max-w-6xl bg-[#0A0A0C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <Book className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-light text-white tracking-wide">
                                        Mission Control <span className="font-bold text-amber-500">Manual</span>
                                    </h2>
                                    <p className="text-white/40 text-sm">Project Constitution, Inventories & Strategic Directives</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-white/40 hover:text-white" />
                            </button>
                        </div>

                        {/* Layout */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Tabs */}
                            <div className="w-64 border-r border-white/10 bg-white/[0.02] flex flex-col py-6 gap-2 px-4">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium tracking-wide",
                                            activeTab === tab.id
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                                : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-amber-500" : "text-white/30")} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                                {activeTab === "inventory" && <InventoryReport />}
                                {activeTab === "constitution" && <ConstitutionReport />}
                                {activeTab === "strategy" && <StrategyReport />}
                                {activeTab === "governance" && <GovernanceReport />}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
