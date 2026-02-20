"use client";

import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    LayoutDashboard,
    Zap,
    ShieldCheck,
    Globe,
    AlertCircle,
    RefreshCw,
    Send,
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Coins,
    Cpu
} from "lucide-react";
import { useEnv } from "@/components/providers/EnvProvider";
import { cn } from "@/lib/utils";
import idl from "../../../lib/idl.json";

// Contracts list (Conceptual as per project architecture)
const PROTOCOL_CONTRACTS = [
    { id: "core", name: "Excelsior Core", description: "Main governance and RWA module", type: "Program" },
    { id: "lxr", name: "Luxor Token ($LXR)", description: "Liquid RWA Backed Token", type: "Token-2022" },
    { id: "xls", name: "Excelsior Share ($XLS)", description: "Protocol Governance Token", type: "Token-2022" },
    { id: "usdx", name: "USDX Stablecoin", description: "Internal Stable Asset", type: "Token-2022" },
];

export const ContractManager = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { env, config } = useEnv();

    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [deploymentStatus, setDeploymentStatus] = useState<Record<string, "deployed" | "not_deployed" | "checking">>(
        Object.fromEntries(PROTOCOL_CONTRACTS.map(c => [c.id, "checking"]))
    );

    useEffect(() => {
        const checkStatus = async () => {
            if (!wallet.publicKey) {
                setLoading(false);
                return;
            }

            try {
                // Check SOL Balance
                const solBalance = await connection.getBalance(wallet.publicKey);
                setBalances(prev => ({ ...prev, SOL: solBalance / LAMPORTS_PER_SOL }));

                // Check Core Program Deployment (Search for GlobalConfig PDA)
                const [globalConfigPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("global_config")],
                    config.programId
                );

                const info = await connection.getAccountInfo(globalConfigPda);

                setDeploymentStatus(prev => ({
                    ...prev,
                    core: info ? "deployed" : "not_deployed",
                    // Mints are assumed exists if addresses are in config (In a real app we'd check getAccountInfo)
                    lxr: "deployed",
                    xls: "deployed",
                    usdx: "not_deployed" // Placeholder
                }));

            } catch (err) {
                console.error("Status check failed:", err);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [connection, wallet.publicKey, env, config]);

    const handleAction = async (contractId: string, action: "publish" | "update") => {
        // Implementation for publish/update logic would go here
        console.log(`${action}ing ${contractId}...`);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        env === "mainnet" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            env === "testnet" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter capitalize">{env} Synchronization</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-white/40 tracking-[0.2em] uppercase">Target RPC:</span>
                            <span className="text-[10px] text-blue-400 font-mono">{config.rpcUrl.split('/')[2]}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-[10px] font-bold text-white/20 tracking-widest uppercase mb-1">Administrator Wallet</div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-mono font-medium text-white">
                            {balances.SOL?.toFixed(2) || "0.00"} SOL
                        </span>
                        {balances.SOL !== undefined && balances.SOL < 0.1 && (
                            <div className="flex items-center gap-1 text-[9px] text-rose-400 animate-pulse font-bold">
                                <AlertCircle size={10} />
                                LOW FUNDS
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contracts List */}
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between px-6 text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase mb-2">
                    <span>Target Component</span>
                    <div className="flex gap-20">
                        <span className="w-32">Status</span>
                        <span className="w-48 text-right">Actions</span>
                    </div>
                </div>

                {PROTOCOL_CONTRACTS.map((contract) => (
                    <div
                        key={contract.id}
                        className="group flex items-center justify-between bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-all duration-500"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                                {contract.type === "Program" ? <Cpu size={20} /> : <Coins size={20} />}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold tracking-tight text-white mb-1">{contract.name}</h4>
                                <p className="text-[10px] text-white/40 font-medium">{contract.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-20">
                            {/* Status Indicator */}
                            <div className="w-32 flex items-center gap-3">
                                {deploymentStatus[contract.id] === "deployed" ? (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <div className="w-1 h-1 rounded-full bg-emerald-400 active-glow" />
                                        <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">Live</span>
                                    </div>
                                ) : deploymentStatus[contract.id] === "checking" ? (
                                    <RefreshCw size={12} className="text-white/20 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                        <div className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">Pending</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="w-48 flex justify-end gap-3">
                                {deploymentStatus[contract.id] === "deployed" ? (
                                    <button
                                        onClick={() => handleAction(contract.id, "update")}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black tracking-widest uppercase hover:bg-white/90 transition-all shadow-lg"
                                    >
                                        <RefreshCw size={12} />
                                        Update
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAction(contract.id, "publish")}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        <Send size={12} />
                                        Publish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] flex gap-4">
                <AlertCircle className="text-blue-400 shrink-0" size={20} />
                <p className="text-[11px] text-blue-400/80 leading-relaxed font-medium">
                    <strong className="text-blue-400 block mb-1 uppercase tracking-widest font-black">Environment Safety</strong>
                    You are currently managing <strong>{env.toUpperCase()}</strong>. Always verify that your local CLI is synced with this network before pushing updates. "Publish" initializes the program storage, while "Update" modifies existing protocol parameters based on your current module configurations.
                </p>
            </div>
        </div>
    );
};
