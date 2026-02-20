
import React, { useState, useEffect } from "react";
import { useProtocol, cn, PROGRAM_ID } from "../shared/index";
import { PublicKey } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { Flame, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const InflationTrigger = () => {
    const { connection, wallet, status, setStatus, message, setMessage, getProgram } = useProtocol();
    const [stats, setStats] = useState({
        totalSupply: 0,
        burned: 0,
        inflationRate: 0,
        isReady: false,
        nextDate: null as Date | null
    });
    const [burnAmount, setBurnAmount] = useState("");

    const fetchState = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey) return;
        try {
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID);
            const config: any = await (program.account as any).GlobalConfig.fetch(configPda);
            const mintInfo = await connection.getTokenSupply(config.lxrMint);

            const lastTime = config.lastInflationTimestamp.toNumber() * 1000;
            const interval = config.inflationInterval.toNumber() * 1000;
            const nextDate = new Date(lastTime + interval);

            setStats({
                totalSupply: mintInfo.value.uiAmount || 0,
                burned: config.totalLxrBurned.toNumber() / 1e9,
                inflationRate: config.inflationRateBps / 100,
                nextDate,
                isReady: Date.now() >= nextDate.getTime()
            });
        } catch (e) {
            console.error("Fetch inflation error", e);
        }
    };

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 30000);
        return () => clearInterval(interval);
    }, [wallet.publicKey]);

    const handleInflation = async () => {
        if (!wallet.publicKey) return;
        setStatus("loading");
        setMessage("Triggering on-chain inflation...");
        try {
            const program = getProgram();
            if (!program) throw new Error("Wallet not connected");
            const [pda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID);
            const config: any = await (program.account as any).GlobalConfig.fetch(pda);

            const tx = await (program as any).methods.triggerInflation().accounts({
                admin: wallet.publicKey,
                globalConfig: pda,
                lxrMint: config.lxrMint,
                reserveWallet: config.rwaWallet, // Using RWA wallet as reserve destination
                tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
            } as any).rpc();

            setStatus("success");
            setMessage("Inflation triggered successfully");
            toast.success("Inflation Triggered", { description: `Tx: ${tx.slice(0, 8)}...` });
            fetchState();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Error triggering inflation");
            toast.error("Process Failed", { description: e.message });
        }
    };

    const handleBurn = async () => {
        if (!wallet.publicKey || !burnAmount) return;
        setStatus("loading");
        setMessage(`Burning ${burnAmount} LXR...`);
        try {
            const program = getProgram();
            if (!program) throw new Error("Wallet not connected");
            const [pda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID);
            const config: any = await (program.account as any).GlobalConfig.fetch(pda);

            const userLxrAta = await web3.PublicKey.findProgramAddressSync(
                [wallet.publicKey.toBuffer(), new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb").toBuffer(), config.lxrMint.toBuffer()],
                new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
            )[0];

            const amount = new BN(parseFloat(burnAmount) * 1e9);
            const tx = await (program as any).methods.manualBurn(amount).accounts({
                admin: wallet.publicKey,
                globalConfig: pda,
                lxrMint: config.lxrMint,
                burnFromAccount: userLxrAta,
                tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
            } as any).rpc();

            setStatus("success");
            setMessage(`Successfully burned ${burnAmount} LXR`);
            toast.success("Tokens Burned", { description: `Tx: ${tx.slice(0, 8)}...` });
            setBurnAmount("");
            fetchState();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Error burning tokens");
            toast.error("Burn Failed", { description: e.message });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Inflation Control */}
            <div className="tech-card p-12 space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Inflation Trigger</h3>
                            <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mt-1">Algorithmic Minting</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">Next Epoch</p>
                        <p className="text-sm font-mono text-white mt-1">
                            {stats.nextDate ? stats.nextDate.toLocaleDateString() : "Loading..."}
                        </p>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 uppercase tracking-widest font-bold">Total Supply</span>
                        <span className="text-white font-mono">{stats.totalSupply.toLocaleString()} LXR</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 uppercase tracking-widest font-bold">Inflation Rate</span>
                        <span className="text-blue-500 font-mono">+{stats.inflationRate}%</span>
                    </div>
                </div>

                <button
                    onClick={handleInflation}
                    disabled={status === 'loading' || !stats.isReady}
                    className="w-full py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/90 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                >
                    {status === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Execute Emission"}
                </button>
            </div>

            {/* Burn Control */}
            <div className="tech-card p-12 space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                            <Flame className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Manual Burn</h3>
                            <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mt-1">Deflationary Action</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">Total Burned</p>
                        <p className="text-sm font-mono text-rose-500 mt-1">{stats.burned.toLocaleString()} LXR</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Amount to permanently remove</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={burnAmount}
                            onChange={(e) => setBurnAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white outline-none focus:border-white/20 transition-all font-mono"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">LXR</div>
                    </div>
                </div>

                <button
                    onClick={handleBurn}
                    disabled={status === 'loading' || !burnAmount}
                    className="w-full py-5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-500 transition-all disabled:opacity-20"
                >
                    Confirm Destruction
                </button>
            </div>
        </div>
    );
};
