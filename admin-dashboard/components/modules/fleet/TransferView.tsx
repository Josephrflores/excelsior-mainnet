
import React, { useState } from "react";
import { Wallet, ChevronDown, CheckCircle2, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, createTransferCheckedInstruction } from "@solana/spl-token";
import { useProtocol, cn } from "../shared/index";
import { FLIGHT_WALLETS, ASSETS } from "./constants";
import { WalletSelectorModal } from "./WalletSelectorModal";

interface TransferViewProps {
    lockedAssetId: string;
    balances: Record<string, { sol: number, lxr: number, xls: number, usdx: number }>;
    fetchBalances: () => void;
}

export const TransferView = ({ lockedAssetId, balances, fetchBalances }: TransferViewProps) => {
    const { wallet, config: envConfig, connection } = useProtocol();
    const { publicKey, signTransaction } = wallet;
    const asset = ASSETS.find(a => a.id === lockedAssetId) || ASSETS[0];
    const [amount, setAmount] = useState("0");
    const [fromWallet, setFromWallet] = useState(FLIGHT_WALLETS[0]);
    const [toWallet, setToWallet] = useState(FLIGHT_WALLETS[1]);
    const [showWalletSelector, setShowWalletSelector] = useState<"from" | "to" | null>(null);
    const [txStatus, setTxStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const currentBalance = balances[fromWallet.address]?.[asset.id as keyof typeof balances[string]] || 0;
    const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= currentBalance;

    const handleSwapWallets = () => {
        const temp = fromWallet;
        setFromWallet(toWallet);
        setToWallet(temp);
    };

    const executeTransfer = async () => {
        if (!publicKey || !signTransaction) {
            setTxStatus("error");
            setErrorMsg("Ledger authorization required. Connect master wallet.");
            return;
        }

        setTxStatus("processing");
        try {
            const fromPubkey = new PublicKey(fromWallet.address);
            const toPubkey = new PublicKey(toWallet.address);
            const factor = asset.id === "sol" ? 1_000_000_000 : 1_000_000_000; // Adjust decimals if needed, assumed 9 for all for now or handled
            // Note: Token decimals might differ. SOL is 9. LXR/XLS are 9. USDX likely 6 or 9.
            // Assuming 9 for now as per original code `amountBN = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000))`
            const amountBN = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));

            const tx = new Transaction();
            const { blockhash } = await connection!.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            if (asset.id === "sol") {
                tx.add(SystemProgram.transfer({ fromPubkey, toPubkey, lamports: amountBN }));
            } else {
                let mint = envConfig.lxrMint;
                if (asset.id === 'xls') mint = envConfig.xlsMint;
                if (asset.id === 'usdx') mint = envConfig.usdxMint;

                const fromAta = getAssociatedTokenAddressSync(mint, fromPubkey, true, TOKEN_2022_PROGRAM_ID);
                const toAta = getAssociatedTokenAddressSync(mint, toPubkey, true, TOKEN_2022_PROGRAM_ID);
                tx.add(createTransferCheckedInstruction(fromAta, mint, toAta, fromPubkey, amountBN, 9, [], TOKEN_2022_PROGRAM_ID));
            }

            const signed = await signTransaction(tx);
            const signature = await connection!.sendRawTransaction(signed.serialize());
            await connection!.confirmTransaction(signature);

            setTxStatus("success");
            fetchBalances();
            setTimeout(() => setTxStatus("idle"), 5000);
        } catch (e: any) {
            setTxStatus("error");
            setErrorMsg(e.message || "Protocol rejection.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto w-full relative group mt-0"
        >
            <div className="bg-[#0a0a0c] rounded-[4rem] border border-white/5 p-10 space-y-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[680px] z-10">
                {/* Header */}
                <div className="flex items-center justify-center mb-8">
                    <div className={cn("px-8 py-3 rounded-full flex items-center gap-3", asset.bg)}>
                        <asset.icon className={cn("w-5 h-5", asset.color)} />
                        <span className={cn("text-sm font-bold tracking-widest uppercase", asset.color)}>{asset.name} BRIDGE</span>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="flex flex-col items-center gap-6 relative">
                    <div className="flex items-baseline gap-4 w-full justify-center">
                        <input
                            autoFocus
                            type="text"
                            value={amount === "0" ? "" : amount}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setAmount(val || "0");
                                if (txStatus !== "idle") setTxStatus("idle");
                            }}
                            placeholder="0"
                            className={cn(
                                "bg-transparent border-none text-8xl font-extralight text-white text-center focus:ring-0 w-3/4 placeholder:text-white/[0.02] tabular-nums tracking-tighter transition-all",
                                parseFloat(amount) > currentBalance && "text-rose-500/80 scale-95"
                            )}
                        />
                        <span className="text-3xl font-extralight text-white/10 uppercase tracking-tighter self-end mb-8">{asset.symbol}</span>
                    </div>
                    <button onClick={() => setAmount(currentBalance.toFixed(asset.id === 'sol' ? 4 : 2))} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-white/30 hover:text-white transition-all border border-white/5 uppercase tracking-widest">
                        Max available: {currentBalance.toLocaleString()}
                    </button>
                </div>

                {/* Terminals */}
                <div className="space-y-6 relative">
                    {/* FROM */}
                    <div onClick={() => setShowWalletSelector("from")} className="bg-white/[0.02] rounded-[2.5rem] p-8 border border-white/5 hover:border-blue-500/30 cursor-pointer hover:bg-blue-500/[0.02] transition-all group/from relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-black/60 border border-white/5 flex items-center justify-center text-white/20 group-hover/from:text-blue-400">
                                    <Wallet size={28} strokeWidth={1} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/10">From</span>
                                    <span className="text-lg font-extralight text-white tracking-tight">{fromWallet.name}</span>
                                    <span className="text-[11px] font-mono text-blue-500/50 tabular-nums">{currentBalance.toLocaleString()} {asset.symbol}</span>
                                </div>
                            </div>
                            <ChevronDown size={16} className="text-white/10" />
                        </div>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <button onClick={(e) => { e.stopPropagation(); handleSwapWallets(); }} className="w-14 h-14 rounded-2xl bg-[#0a0a0c] border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)] hover:bg-blue-500 hover:text-black transition-all">
                            <ArrowLeftRight size={22} />
                        </button>
                    </div>

                    {/* TO */}
                    <div onClick={() => setShowWalletSelector("to")} className="bg-white/[0.02] rounded-[2.5rem] p-8 border border-white/5 hover:border-blue-500/30 cursor-pointer hover:bg-blue-500/[0.02] transition-all group/to relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-black/60 border border-white/5 flex items-center justify-center text-white/20 group-hover/to:text-blue-400">
                                    <CheckCircle2 size={28} strokeWidth={1} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] uppercase font-black tracking-[0.4em] text-white/10">To</span>
                                    <span className="text-lg font-extralight text-white tracking-tight">{toWallet.name}</span>
                                    <span className="text-[11px] font-mono text-white/10 tabular-nums">
                                        {(balances[toWallet.address]?.[asset.id as keyof typeof balances[string]] || 0).toLocaleString()} {asset.symbol}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown size={16} className="text-white/10" />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={executeTransfer}
                    disabled={!isValidAmount || txStatus === "processing"}
                    className={cn(
                        "w-full py-8 rounded-[2.5rem] font-black tracking-[0.4em] text-[11px] uppercase shadow-3xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 relative overflow-hidden",
                        txStatus === "processing" ? "bg-blue-600/50 cursor-wait animate-pulse" :
                            txStatus === "success" ? "bg-emerald-600 text-white" :
                                txStatus === "error" ? "bg-rose-600 text-white" :
                                    isValidAmount ? "bg-white text-black hover:bg-white/90" : "bg-white/[0.02] text-white/5 cursor-not-allowed border border-white/5"
                    )}
                >
                    {txStatus === "processing" ? "Synchronizing..." :
                        txStatus === "success" ? "Success" :
                            txStatus === "error" ? "Failed" : "Authorize Transfer"}
                </button>
                {txStatus === 'error' && <p className="text-center text-rose-500 text-xs">{errorMsg}</p>}

                {showWalletSelector && (
                    <WalletSelectorModal
                        balances={balances}
                        showWalletSelector={showWalletSelector}
                        fromWallet={fromWallet}
                        toWallet={toWallet}
                        setFromWallet={setFromWallet}
                        setToWallet={setToWallet}
                        onClose={() => setShowWalletSelector(null)}
                    />
                )}
            </div>
        </motion.div>
    );
};
