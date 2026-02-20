"use client";

import React from "react";
import { useEnv } from "@/components/providers/EnvProvider";
import { cn } from "@/lib/utils";
import { Globe, Server, Activity } from "lucide-react";
import { motion } from "framer-motion";

import { DeploymentControl } from "../modules/supply/DeploymentControl";

export const EnvSwitcher = () => {
    const { env, setEnv, isSimulation, setSimulation } = useEnv();

    return (
        <div className="fixed top-6 right-6 z-[3000]">
            <div className="flex items-center gap-3">
                <DeploymentControl />
                <div className="flex items-center p-1 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl transition-all bg-[#0A0A0C]/80">
                    <button
                        onClick={() => setSimulation(true)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                            isSimulation
                                ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/20 scale-105"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", !isSimulation && "opacity-0")} />
                        <span>Source</span>
                    </button>
                    <div className="w-px h-3 bg-white/10 mx-1" />
                    <button
                        onClick={() => env !== "devnet" && setEnv("devnet")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                            env === "devnet" && !isSimulation
                                ? "bg-white text-black shadow-lg scale-105"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", (env !== "devnet" || isSimulation) && "opacity-0")} />
                        <span>Devnet</span>
                    </button>
                    <button
                        onClick={() => env !== "testnet" && setEnv("testnet")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                            env === "testnet" && !isSimulation
                                ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 scale-105"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <div className={cn("w-1.5 h-1.5 rounded-full bg-black", (env !== "testnet" || isSimulation) && "opacity-0")} />
                        <span>Testnet</span>
                    </button>
                    <button
                        onClick={() => env !== "mainnet" && setEnv("mainnet")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                            env === "mainnet" && !isSimulation
                                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <div className={cn("w-1.5 h-1.5 rounded-full bg-white animate-pulse", (env !== "mainnet" || isSimulation) && "opacity-0")} />
                        <span>Mainnet</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
