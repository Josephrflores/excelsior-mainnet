"use client";

import React, { useState } from 'react';
import {
    TrendingUp, Database, Lock, Cpu,
    BarChart3, Activity, Shield, ShieldAlert, Coins,
    ChevronLeft, ChevronRight, Zap, Factory, RefreshCw, Send, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationMoonProps {
    activeModule: string;
    onModuleChange: (id: string) => void;
}

const allModules = [
    { id: "advanced-economy", label: "Economía", icon: TrendingUp },
    { id: "security-god-mode", label: "God Mode", icon: ShieldAlert },
    { id: "liquidity-reserves", label: "Liquidez", icon: Coins },
    { id: "hardware-integration", label: "Hardware", icon: Cpu },
    { id: "supply", label: "Suministro", icon: Activity },
    { id: "staking", label: "Staking", icon: Database },
    { id: "inflation", label: "Inflación", icon: Zap },
    { id: "contract-factory", label: "Fábrica", icon: Factory },
    { id: "swap-convert", label: "Intercambio", icon: RefreshCw },
    { id: "fleet-transfer", label: "Mover Fondos", icon: Send },
    { id: "governance", label: "Gobernanza", icon: ShieldCheck },
    { id: "analytics", label: "Métricas", icon: BarChart3 },
];

const ITEMS_PER_PAGE = 5;

const NavigationMoon = ({ activeModule, onModuleChange }: NavigationMoonProps) => {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(allModules.length / (ITEMS_PER_PAGE - 1)); // Overlap for continuity? No, simple paging.

    // We show a slice of modules
    const startIndex = page * (ITEMS_PER_PAGE - 1);
    const visibleModules = allModules.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const nextPage = () => {
        if (startIndex + ITEMS_PER_PAGE < allModules.length) {
            setPage(p => p + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage(p => p - 1);
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-visible">
            {/* The Orbital Arc Container */}
            <div className="relative w-[1000px] h-[600px]">

                {/* Navigation Arrows */}
                <div className="absolute inset-x-0 top-1/2 flex justify-between px-10 pointer-events-auto -translate-y-1/2 z-30">
                    <button
                        onClick={prevPage}
                        disabled={page === 0}
                        className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#1a73e8] transition-all disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextPage}
                        disabled={startIndex + ITEMS_PER_PAGE >= allModules.length}
                        className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-[#1a73e8] transition-all disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Icons Grid arranged in Orbit */}
                <div className="absolute inset-0 flex items-center justify-between">
                    {visibleModules.map((mod, index) => {
                        const total = visibleModules.length;
                        const startAngle = Math.PI * 0.12;
                        const endAngle = Math.PI * 0.88;
                        const angle = startAngle + (index / (total - 1)) * (endAngle - startAngle);

                        const radiusX = 420;
                        const radiusY = 240;

                        const x = Math.cos(angle + Math.PI) * radiusX;
                        const y = Math.sin(angle) * radiusY;

                        const isActive = activeModule === mod.id;

                        return (
                            <button
                                key={mod.id}
                                onClick={() => onModuleChange(mod.id)}
                                className={cn(
                                    "absolute group flex flex-col items-center gap-5 transition-all duration-700 pointer-events-auto animate-in fade-in scale-in-90",
                                    isActive ? "z-20 scale-125" : "z-10 hover:scale-110"
                                )}
                                style={{
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% + ${y + 60}px)`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {/* Flat Icon Sphere */}
                                <div className={cn(
                                    "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                                    "bg-black/40 backdrop-blur-xl border border-white/10",
                                    isActive
                                        ? "border-[#1a73e8] bg-[#1a73e8]/10 shadow-[0_0_30px_rgba(26,115,232,0.2)]"
                                        : "group-hover:border-[#1a73e8]/50"
                                )}>
                                    <mod.icon className={cn(
                                        "w-8 h-8 transition-all duration-500",
                                        isActive ? "text-[#1a73e8] scale-110 active-glow" : "text-white opacity-40 group-hover:opacity-100 group-hover:text-white"
                                    )} />

                                    {/* Subtle Glow Overlay */}
                                    <div className={cn(
                                        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl bg-[#1a73e8]"
                                    )} />
                                </div>

                                {/* Label */}
                                <span className={cn(
                                    "text-[11px] font-medium tracking-tight transition-all duration-500",
                                    isActive ? "text-white opacity-100" : "text-white/60 group-hover:text-white"
                                )}>
                                    {mod.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NavigationMoon;
