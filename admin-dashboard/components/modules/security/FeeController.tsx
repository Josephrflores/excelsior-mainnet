"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Zap, ShieldCheck, RefreshCw, ArrowUpRight } from "lucide-react";
import { useProtocol, LXR_MINT, cn } from "../shared/index";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

interface FeeControllerProps {
    currentFee: number;
    maxFee: number;
    onUpdate?: () => void;
}

export const FeeController = ({ currentFee, maxFee, onUpdate }: FeeControllerProps) => {
    const { status, setStatus, message, setMessage, getProgram, wallet } = useProtocol();
    const [localFee, setLocalFee] = useState(currentFee);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setLocalFee(currentFee);
    }, [currentFee]);

    const handleUpdateFee = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey) return;

        setStatus("loading");
        setIsSyncing(true);
        try {
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("global_config")],
                program.programId
            );

            const tx = await (program.methods as any)
                .updateFee(localFee)
                .accounts({
                    admin: wallet.publicKey,
                    globalConfig: configPda,
                } as any)
                .rpc();

            setStatus("success");
            setMessage(`Fee updated to ${(localFee / 100).toFixed(2)}%`);
            if (onUpdate) onUpdate();
        } catch (e: any) {
            console.error(e);
            setStatus("error");
            setMessage(e.message || "Failed to update fee");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="tech-card p-8 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a73e8]/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#1a73e8]/10 transition-all duration-1000" />

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center border border-[#1a73e8]/20">
                        <Settings2 className="w-6 h-6 text-[#1a73e8]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-white tracking-tight">Dynamic Fee Controller</h3>
                        <p className="text-white font-bold tracking-[0.2em] mt-1">Token-2022 Transfer Protocol</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white font-bold tracking-widest mb-1">Safety Cap</span>
                    <span className="text-sm font-medium text-white">{(maxFee / 100).toFixed(2)}%</span>
                </div>
            </div>

            <div className="space-y-10 relative z-10">
                <div className="flex flex-col items-center justify-center py-6 bg-white/[0.02] rounded-3xl border border-white/5 shadow-inner">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-medium text-white tracking-tighter tabular-nums drop-shadow-2xl">
                            {(localFee / 100).toFixed(2)}
                        </span>
                        <span className="text-2xl font-bold text-[#1a73e8]">%</span>
                    </div>
                    <p className="text-white font-medium tracking-[0.3em] mt-2">Current basis points: {localFee}</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="range"
                        min="0"
                        max={maxFee}
                        step="1"
                        value={localFee}
                        onChange={(e) => setLocalFee(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#1a73e8] hover:accent-[#1a73e8]/80 transition-all"
                    />
                    <div className="flex justify-between text-[10px] text-white font-bold tracking-tighter">
                        <span>0.00%</span>
                        <span>{(maxFee / 100).toFixed(2)}% (Hard Cap)</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group/item hover:border-[#1a73e8]/30 transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#1a73e8]/5 flex items-center justify-center">
                            <Zap size={14} className="text-[#1a73e8] opacity-40 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <p className="text-[9px] text-white font-bold tracking-widest mb-0.5">Yield Impact</p>
                            <p className="text-xs font-medium text-white">Aggressive growth</p>
                        </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group/item hover:border-[#1a73e8]/30 transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#1a73e8]/5 flex items-center justify-center">
                            <ShieldCheck size={14} className="text-[#1a73e8] opacity-40 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <p className="text-[9px] text-white font-bold tracking-widest mb-0.5">Circulation</p>
                            <p className="text-xs font-medium text-white">Controlled burn</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleUpdateFee}
                    disabled={isSyncing || localFee === currentFee}
                    className={cn(
                        "w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 font-black tracking-[0.25em] text-[10px] transition-all duration-500 shadow-2xl disabled:opacity-20",
                        localFee === currentFee
                            ? "bg-white/5 text-white/20 border border-white/5"
                            : "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-[#1a73e8]/20"
                    )}
                >
                    {isSyncing ? (
                        <>
                            <RefreshCw size={14} className="animate-spin" />
                            Synchronizing...
                        </>
                    ) : (
                        <>
                            <ArrowUpRight size={14} />
                            Deploy Fee Update
                        </>
                    )}
                </button>

                {status !== 'idle' && (
                    <div className={cn(
                        "text-center text-[10px] font-bold tracking-widest animate-pulse",
                        status === 'error' ? 'text-red-500' : 'text-[#1a73e8]'
                    )}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};
