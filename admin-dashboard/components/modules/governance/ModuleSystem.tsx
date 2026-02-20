
import React from "react";
import { Globe, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { useProtocol, cn } from "../shared/index";

interface ModuleSystemProps {
    config: any;
    fetchGovernanceState: () => void;
}

export const ModuleSystem = ({ config, fetchGovernanceState }: ModuleSystemProps) => {
    const { status, setStatus, setMessage, getProgram, wallet } = useProtocol();

    const handleToggleModule = async (flagId: number, currentStatus: boolean) => {
        const program = getProgram();
        if (!program || !wallet.publicKey) return;

        setStatus("loading");
        try {
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("global_config")],
                program.programId
            );

            // Toggle: If active, disable. If inactive, enable.
            const enable = !currentStatus;

            const tx = await (program.methods as any)
                .toggleModule(flagId, enable)
                .accounts({
                    globalConfig: configPda,
                    admin: wallet.publicKey,
                } as any)
                .rpc();

            setStatus("success");
            setMessage(`Module ${flagId === 1 ? 'Excelsior (RWA)' : 'USDX Stablecoin'} ${enable ? 'ACTIVATED' : 'PAUSED'}`);
            fetchGovernanceState();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Failed to toggle module");
        }
    };

    return (
        <motion.div
            key="modules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <h1 className="text-4xl font-light text-white tracking-tight mb-12">Modular Systems</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Module 1: Excelsior (RWA) */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div className={cn(
                            "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]",
                            (config?.moduleFlags & 1) !== 0 ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
                        )} />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Excelsior (RWA)</h3>
                    <p className="text-sm text-white/40 mb-8 leading-relaxed">
                        Real Estate & Infrastructure Index module. Handles asset tokenization and valuation logic.
                    </p>
                    <button
                        onClick={() => handleToggleModule(1, (config?.moduleFlags & 1) !== 0)}
                        className={cn(
                            "w-full py-4 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                            (config?.moduleFlags & 1) !== 0
                                ? "bg-white/5 text-emerald-500 hover:bg-red-500/10 hover:text-red-500"
                                : "bg-[#1a73e8] text-white hover:bg-[#1557b0]"
                        )}
                    >
                        {(config?.moduleFlags & 1) !== 0 ? "Deactivate Module" : "Activate Module"}
                    </button>
                </div>

                {/* Module 2: USDX Stablecoin */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all">
                            <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div className={cn(
                            "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]",
                            (config?.moduleFlags & 2) !== 0 ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
                        )} />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">USDX Stablecoin</h3>
                    <p className="text-sm text-white/40 mb-8 leading-relaxed">
                        150% Over-Collateralized Bridge. Manages stability mechanisms and redemption flows.
                    </p>
                    <button
                        onClick={() => handleToggleModule(2, (config?.moduleFlags & 2) !== 0)}
                        className={cn(
                            "w-full py-4 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                            (config?.moduleFlags & 2) !== 0
                                ? "bg-white/5 text-emerald-500 hover:bg-red-500/10 hover:text-red-500"
                                : "bg-[#1a73e8] text-white hover:bg-[#1557b0]"
                        )}
                    >
                        {(config?.moduleFlags & 2) !== 0 ? "Deactivate Module" : "Activate Module"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
