
import React, { useState, useEffect } from "react";
import { BadgeDollarSign, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useProtocol, cn } from "../shared/index";
import { BN, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const USDXStablecoin = () => {
    const { status, setStatus, setMessage, message, getProgram, connection, wallet } = useProtocol();
    const [usdxAction, setUsdxAction] = useState<"mint" | "redeem">("mint");
    const [usdxAmount, setUsdxAmount] = useState("");
    const [currentConfig, setCurrentConfig] = useState<any>(null);
    const [collateralBalance, setCollateralBalance] = useState(0);
    const [usdxBalance, setUsdxBalance] = useState(0);

    const fetchUSDXData = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey) return;
        try {
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);
            setCurrentConfig(configData);

            // Fetch balances
            const userCollateralAta = await getAssociatedTokenAddress(configData.lxrMint, wallet.publicKey);
            const userUsdxAta = await getAssociatedTokenAddress(configData.usdxMint, wallet.publicKey);

            try {
                const collatBal = await connection.getTokenAccountBalance(userCollateralAta);
                setCollateralBalance(collatBal.value.uiAmount || 0);
            } catch (e) { }

            try {
                const usdxBal = await connection.getTokenAccountBalance(userUsdxAta);
                setUsdxBalance(usdxBal.value.uiAmount || 0);
            } catch (e) { }

        } catch (error) {
            console.error("Error fetching USDX state:", error);
        }
    };

    useEffect(() => {
        fetchUSDXData();
    }, [wallet.publicKey]);

    const handleUsdxOperation = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey || !currentConfig) return;
        setStatus("loading");
        setMessage(usdxAction === 'mint' ? "Minting USDX..." : "Redeeming USDX...");

        try {
            const amount = new BN(parseFloat(usdxAmount) * 1e6); // Assuming 6 decimals for USDX
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);

            // ATAs
            const userCollateralAta = await getAssociatedTokenAddress(currentConfig.lxrMint, wallet.publicKey);
            const userUsdxAta = await getAssociatedTokenAddress(currentConfig.usdxMint, wallet.publicKey);

            let tx;
            if (usdxAction === 'mint') {
                tx = await (program.methods as any).mintUsdx(amount).accounts({
                    user: wallet.publicKey,
                    globalConfig: configPda,
                    userCollateral: userCollateralAta,
                    userUsdx: userUsdxAta,
                    usdxReserve: currentConfig.usdxReserve,
                    usdxMint: currentConfig.usdxMint,
                    tokenProgram: TOKEN_PROGRAM_ID, // Or TOKEN_2022 if applicable
                }).rpc();
            } else {
                tx = await (program.methods as any).redeemUsdx(amount).accounts({
                    user: wallet.publicKey,
                    globalConfig: configPda,
                    userCollateral: userCollateralAta,
                    userUsdx: userUsdxAta,
                    usdxReserve: currentConfig.usdxReserve,
                    usdxMint: currentConfig.usdxMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                }).rpc();
            }

            setStatus("success");
            setMessage(`Successfully ${usdxAction === 'mint' ? 'Minted' : 'Redeemed'} ${usdxAmount} USDX`);
            toast.success("Transaction Confirmed", { description: `Tx: ${tx.slice(0, 8)}...` });
            setUsdxAmount("");
            fetchUSDXData();
        } catch (error: any) {
            console.error("USDX operation error:", error);
            setStatus("error");
            setMessage(error.message || "Operation failed");
            toast.error("Operation Failed", { description: error.message });
        }
    };

    return (
        <motion.div
            key="usdx"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <BadgeDollarSign className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-light text-white tracking-tight">USDX Stablecoin</h1>
                        <p className="text-white/40 text-xs font-mono mt-1">Algorithmic Peg Mechanism</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-white/40 font-medium tracking-wide mb-1">USER BALANCE</p>
                    <p className="text-2xl font-light text-white tracking-tight">${usdxBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="p-10 border border-white/5 bg-white/[0.01] rounded-[3rem] max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-500" />

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-2xl mb-8">
                    <button
                        onClick={() => setUsdxAction("mint")}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                            usdxAction === "mint" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        Mint USDX
                    </button>
                    <button
                        onClick={() => setUsdxAction("redeem")}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                            usdxAction === "redeem" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        Redeem LXR
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-xs text-white/60 font-medium tracking-wide">
                            {usdxAction === 'mint' ? "AMOUNT TO MINT (USDX)" : "AMOUNT TO REDEEM (USDX)"}
                        </label>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-light text-2xl">$</div>
                            <input
                                type="number"
                                value={usdxAmount}
                                onChange={(e) => setUsdxAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-6 pl-12 pr-6 text-3xl font-light text-white outline-none focus:border-white/20 transition-all tabular-nums"
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40">Exchange Rate</span>
                            <span className="text-white">1 USDX = $1.00</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40">Collateral Required</span>
                            <span className="text-white">
                                {usdxAmount ? `${(parseFloat(usdxAmount) * 1.5).toFixed(2)} LXR` : "0.00 LXR"}
                                <span className="text-white/20 ml-1">(150%)</span>
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40">Your LXR Balance</span>
                            <span className="text-white">{collateralBalance.toFixed(2)} LXR</span>
                        </div>
                    </div>

                    <button
                        onClick={handleUsdxOperation}
                        disabled={status === 'loading' || !usdxAmount}
                        className={cn(
                            "w-full py-6 rounded-2xl text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg",
                            usdxAction === 'mint' ? "bg-emerald-500 text-black shadow-emerald-500/20" : "bg-blue-500 text-black shadow-blue-500/20"
                        )}
                    >
                        {status === 'loading' ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : usdxAction === 'mint' ? "Confirm Mint" : "Confirm Redemption"}
                    </button>

                    {status !== 'idle' && (
                        <div className={cn(
                            "p-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2",
                            status === 'success' ? "bg-emerald-500/10 text-emerald-500" : status === 'error' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : status === 'error' ? <AlertCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
