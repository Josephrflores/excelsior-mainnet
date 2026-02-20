
import React, { useState, useEffect } from "react";
import { ArrowUpDown, RefreshCw, Coins, Zap, Activity } from "lucide-react";
import { cn } from "../shared/index";
import { ASSETS } from "./constants";
import { useProtocol, LXR_MINT, XLS_MINT, PROGRAM_ID } from "../shared/index";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";

const RPC_URL = "https://api.devnet.solana.com";

export const SwapCard = () => {
    const { status, setStatus, message, setMessage, getProgram, wallet } = useProtocol();
    const [amount, setAmount] = useState("0");
    const [fromAsset, setFromAsset] = useState(ASSETS[0]);
    const [toAsset, setToAsset] = useState(ASSETS[1]);
    const [balances, setBalances] = useState<Record<string, number>>({ sol: 0, lxr: 0, xls: 0 });
    const [isFetching, setIsFetching] = useState(false);

    const [livePrices, setLivePrices] = useState<Record<string, number>>({
        lxr: 1.00,
        xls: 0.85,
        sol: 145.20
    });

    const fetchBalances = async () => {
        if (!wallet.publicKey) return;
        setIsFetching(true);
        try {
            const connection = new Connection(RPC_URL, "confirmed");
            const sol = await connection.getBalance(wallet.publicKey);

            let lxr = 0;
            try {
                const ata = getAssociatedTokenAddressSync(LXR_MINT, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata);
                lxr = bal.value.uiAmount || 0;
            } catch (e) { }

            let xls = 0;
            try {
                const ata = getAssociatedTokenAddressSync(XLS_MINT, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
                const bal = await connection.getTokenAccountBalance(ata);
                xls = bal.value.uiAmount || 0;
            } catch (e) { }

            setBalances({ sol: sol / LAMPORTS_PER_SOL, lxr, xls });
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, [wallet.publicKey]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLivePrices(prev => ({
                lxr: +(prev.lxr * (1 + (Math.random() * 0.002 - 0.001))).toFixed(4),
                xls: +(prev.xls * (1 + (Math.random() * 0.002 - 0.001))).toFixed(4),
                sol: +(prev.sol * (1 + (Math.random() * 0.004 - 0.002))).toFixed(2),
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSwapAssets = () => {
        const temp = fromAsset;
        setFromAsset(toAsset);
        setToAsset(temp);
    };

    return (
        <div className="max-w-[480px] mx-auto w-full relative">
            <div className="bg-[#0f0f12] rounded-[3rem] border border-white/5 p-8 space-y-10 shadow-2xl relative overflow-hidden min-h-[580px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-[100px] -z-10 bg-[#1a73e8]/10" />

                {/* Amount Input */}
                <div className="flex flex-col items-center justify-center space-y-6 py-8 relative">
                    <div className="flex items-baseline gap-3">
                        <input
                            type="text"
                            value={amount === "0" ? "" : amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0.9.]/g, '') || "0")}
                            placeholder="0"
                            className="bg-transparent border-none text-8xl font-medium text-white text-center focus:ring-0 w-full placeholder:text-white/5 tabular-nums tracking-tighter"
                        />
                        <span className="text-3xl font-bold text-white/20 uppercase tracking-tighter self-end mb-6">
                            USD
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#1a73e8]/5 text-[#1a73e8] border border-[#1a73e8]/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
                            Market: ${livePrices[fromAsset.id].toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Asset Switcher */}
                <div className="space-y-4 relative">
                    <div className="bg-black/[0.15] rounded-[2.5rem] p-7 border border-white/5 transition-all text-left group backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 shadow-xl", fromAsset.bg, fromAsset.glow)}>
                                    <fromAsset.icon className={cn(fromAsset.color, "drop-shadow-lg")} size={28} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/20">Pay With</span>
                                    <span className="text-base font-bold text-white uppercase">{fromAsset.name}</span>
                                    <span className="text-[10px] font-mono text-white/40">Balance: {balances[fromAsset.id as keyof typeof balances]?.toLocaleString() || "0.00"}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-base font-bold text-white tabular-nums tracking-tighter">$0.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button onClick={handleSwapAssets} className="w-12 h-12 rounded-2xl bg-[#0f0f12] border border-white/10 text-white/40 flex items-center justify-center shadow-2xl hover:text-[#1a73e8] hover:border-[#1a73e8]/30 transition-all active:scale-90 group">
                            <ArrowUpDown size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>

                    <div className="bg-black/[0.15] rounded-[2.5rem] p-7 border border-white/5 transition-all text-left backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 shadow-xl", toAsset.bg, toAsset.glow)}>
                                    <toAsset.icon className={cn(toAsset.color, "drop-shadow-lg")} size={28} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/20">Receive</span>
                                    <span className="text-base font-bold text-white uppercase">{toAsset.name}</span>
                                    <span className="text-[10px] font-mono text-white/40">Balance: {balances[toAsset.id as keyof typeof balances]?.toLocaleString() || "0.00"}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-base font-bold text-white/40 tabular-nums tracking-tighter">0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        if (!wallet.publicKey) return;
                        setStatus("loading");
                        setMessage("Initializing conversion...");

                        try {
                            const program = getProgram();
                            if (!program) throw new Error("Wallet disconnected");

                            const val = parseFloat(amount);
                            if (isNaN(val) || val <= 0) throw new Error("Invalid amount");
                            const amountBN = new BN(val * 1_000_000_000);

                            let tx;
                            if (fromAsset.id === "sol" && toAsset.id === "xls") {
                                // Comprar XLS con SOL
                                tx = await (program as any).methods.buyXls(amountBN).accounts({
                                    user: wallet.publicKey,
                                    globalConfig: PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID)[0],
                                    userXlsAccount: getAssociatedTokenAddressSync(XLS_MINT, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID),
                                    xlsVaultSupply: (await (program.account as any).globalConfig.fetch(PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID)[0])).xlsVaultSupply,
                                    xlsMint: XLS_MINT,
                                } as any).rpc();
                            } else if (fromAsset.id === "xls" && toAsset.id === "sol") {
                                // Canjear XLS por SOL
                                tx = await (program as any).methods.redeemXls(amountBN).accounts({
                                    user: wallet.publicKey,
                                    globalConfig: PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID)[0],
                                    userXlsAccount: getAssociatedTokenAddressSync(XLS_MINT, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID),
                                    xlsVaultSupply: (await (program.account as any).globalConfig.fetch(PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID)[0])).xlsVaultSupply,
                                    xlsMint: XLS_MINT,
                                } as any).rpc();
                            } else {
                                throw new Error("Route not implemented on-chain yet");
                            }

                            setStatus("success");
                            setMessage(`Success: ${tx.slice(0, 16)}`);
                            fetchBalances();
                        } catch (e: any) {
                            console.error(e);
                            setStatus("error");
                            setMessage(e.message || "Conversion failed");
                        }
                    }}
                    disabled={status === 'loading'}
                    className="w-full py-7 rounded-[2rem] bg-[#1a73e8] text-white font-black tracking-[0.25em] text-[10px] uppercase hover:bg-[#1557b0] shadow-2xl shadow-[#1a73e8]/20 transition-all active:scale-[0.97] disabled:opacity-20"
                >
                    {status === 'loading' ? "Synchronizing..." : "Initiate Protocol Swap"}
                </button>
                {status !== 'idle' && (
                    <p className={cn(
                        "text-center text-[10px] font-bold uppercase tracking-widest mt-4 animate-pulse",
                        status === 'error' ? 'text-red-500' : 'text-[#1a73e8]'
                    )}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};
