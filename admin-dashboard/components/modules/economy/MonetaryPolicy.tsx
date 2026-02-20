
import React, { useState, useEffect } from "react";
import { Scale, TrendingUp, Banknote, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useProtocol, cn } from "../shared/index";
import { BN, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

export const MonetaryPolicy = () => {
    const { status, setStatus, setMessage, message, getProgram, config } = useProtocol();
    const [targetInflation, setTargetInflation] = useState("2.5");
    const [incomeTaxRate, setIncomeTaxRate] = useState("1.0");
    const [currentConfig, setCurrentConfig] = useState<any>(null);

    const fetchConfig = async () => {
        const program = getProgram();
        if (!program) return;
        try {
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);
            setCurrentConfig(configData);
            setTargetInflation((configData.inflationRateBps / 100).toString());
            setIncomeTaxRate((configData.feeBasisPoints / 100).toString());
        } catch (error) {
            console.error("Error fetching config:", error);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [config]);

    const handleUpdateInflation = async () => {
        const program = getProgram();
        if (!program || !currentConfig) return;
        setStatus("loading");
        setMessage("Updating inflation rate...");

        try {
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const newRateBps = Math.round(parseFloat(targetInflation) * 100);

            const tx = await (program.methods as any).upgradeConfig(
                new BN(currentConfig.inflationInterval),
                newRateBps,
                currentConfig.pythOracle,
                currentConfig.chainlinkOracle,
                new BN(currentConfig.oracleStalenessThreshold),
                currentConfig.maxDailyWithdrawalBps,
                currentConfig.timelockThresholdBps,
                new BN(currentConfig.timelockDuration),
                currentConfig.moduleFlags
            ).accounts({
                admin: program.provider.publicKey,
                globalConfig: configPda,
                rwaVaultLxr: currentConfig.rwaVaultLxr,
                xlsVaultSupply: currentConfig.xlsVaultSupply,
                lxrVaultRewards: currentConfig.lxrVaultRewards,
                newXlsMint: currentConfig.xlsMint,
                newLxrMint: currentConfig.lxrMint,
                usdxMint: currentConfig.usdxMint,
                usdxReserve: currentConfig.usdxReserve,
                systemProgram: web3.SystemProgram.programId,
            }).rpc();

            setStatus("success");
            setMessage(`Inflation rate updated to ${targetInflation}%`);
            toast.success("Policy Updated", { description: `Tx: ${tx.slice(0, 8)}...` });
            fetchConfig();
        } catch (error: any) {
            console.error("Inflation update error:", error);
            setStatus("error");
            setMessage(error.message || "Failed to update inflation");
            toast.error("Update Failed", { description: error.message });
        }
    };

    const handleUpdateFee = async () => {
        const program = getProgram();
        if (!program) return;
        setStatus("loading");
        setMessage("Updating protocol fees...");

        try {
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const newFeeBps = Math.round(parseFloat(incomeTaxRate) * 100);

            const tx = await (program.methods as any).updateFee(newFeeBps).accounts({
                admin: program.provider.publicKey,
                globalConfig: configPda,
            }).rpc();

            setStatus("success");
            setMessage(`Protocol fees updated to ${incomeTaxRate}%`);
            toast.success("Fee Updated", { description: `Tx: ${tx.slice(0, 8)}...` });
            fetchConfig();
        } catch (error: any) {
            console.error("Fee update error:", error);
            setStatus("error");
            setMessage(error.message || "Failed to update fee");
            toast.error("Update Failed", { description: error.message });
        }
    };

    return (
        <motion.div
            key="policy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
        >
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center">
                    <Scale className="w-8 h-8 text-violet-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tight">Monetary Policy</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">Inflation & Tax Parameters</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inflation Control */}
                <div className="p-10 border border-white/5 bg-white/[0.01] rounded-3xl space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                        <h3 className="text-lg font-medium text-white">Inflation Targeting</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-xs text-white/60 font-medium tracking-wide">TARGET RATE</label>
                            <span className="text-xs text-violet-400 font-bold">{targetInflation}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={targetInflation}
                            onChange={(e) => setTargetInflation(e.target.value)}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                        <p className="text-[10px] text-white/40">
                            Controls the annual issuance rate of new LXR tokens distributed to stakers and the protocol treasury.
                        </p>
                    </div>
                    <button
                        onClick={handleUpdateInflation}
                        disabled={status === 'loading'}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        {status === 'loading' && message.includes("inflation") ? "Deploying..." : "Update Rate"}
                    </button>
                </div>

                {/* Income Tax */}
                <div className="p-10 border border-white/5 bg-white/[0.01] rounded-3xl space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-medium text-white">Protocol Fees</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-xs text-white/60 font-medium tracking-wide">TRANSACTION TAX</label>
                            <span className="text-xs text-emerald-400 font-bold">{incomeTaxRate}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={incomeTaxRate}
                            onChange={(e) => setIncomeTaxRate(e.target.value)}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <p className="text-[10px] text-white/40">
                            Network fee applied to LXR transfers (burn mechanism).
                        </p>
                    </div>
                    <button
                        onClick={handleUpdateFee}
                        disabled={status === 'loading'}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        {status === 'loading' && message.includes("fees") ? "Deploying..." : "Update Fee"}
                    </button>
                </div>
            </div>

            {status !== 'idle' && (
                <div className={cn(
                    "p-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2",
                    status === 'success' ? "bg-emerald-500/10 text-emerald-500" : status === 'error' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                )}>
                    {status === 'success' ? <CheckCircle className="w-4 h-4" /> : status === 'error' ? <AlertCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
                    {message}
                </div>
            )}
        </motion.div>
    );
};
