"use client";

import React from 'react';
import { cn } from "@/components/modules/shared";
import { LucideIcon, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface SubTopic {
    id: string;
    label: string;
    icon?: LucideIcon;
}

interface InnerSidebarProps {
    title: string;
    subTopics: SubTopic[];
    activeSubTopic: string;
    onSubTopicChange: (id: string) => void;
}

const InnerSidebar = ({ title, subTopics, activeSubTopic, onSubTopicChange }: InnerSidebarProps) => {
    return (
        <aside className="w-full md:w-72 shrink-0 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-10">
                <div className="px-2">
                    <h3 className="text-[10px] font-black text-white tracking-[0.4em] mb-4">
                        Protocol Architecture
                    </h3>
                    <div className="h-[1px] w-12 bg-blue-500/20" />
                </div>

                <div className="space-y-2">
                    {subTopics.map((sub) => {
                        const isActive = activeSubTopic === sub.id;

                        return (
                            <button
                                key={sub.id}
                                onClick={() => onSubTopicChange(sub.id)}
                                className={cn(
                                    "w-full group flex items-center justify-between p-5 rounded-[1.5rem] transition-all duration-500 relative overflow-hidden",
                                    isActive
                                        ? "bg-white text-black shadow-2xl shadow-blue-500/10 scale-105"
                                        : "hover:bg-white/[0.03] text-white/30 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    {sub.icon && (
                                        <sub.icon className={cn(
                                            "w-4 h-4 transition-all duration-500",
                                            isActive ? "text-black scale-110" : "text-white/10 group-hover:text-white/40 group-hover:scale-110"
                                        )} strokeWidth={isActive ? 2.5 : 1.5} />
                                    )}
                                    <span className="text-[11px] font-bold tracking-widest transition-all">
                                        {sub.label}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="relative z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                    </div>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-white"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Status indicator */}
                <div className="px-4 py-6 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse border border-blue-400/50" />
                        <span className="text-[9px] font-black text-white tracking-[0.2em]">{title} Synchronized</span>
                    </div>
                    <p className="text-[10px] text-white leading-relaxed font-medium">
                        Real-time protocol monitoring and autonomous fleet displacement.
                    </p>
                </div>
            </div>
        </aside>
    );
};


export default InnerSidebar;
