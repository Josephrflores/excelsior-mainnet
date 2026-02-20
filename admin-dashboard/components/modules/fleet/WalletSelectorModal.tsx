
import React, { useState } from "react";
import { Search, X, Wallet, Zap, Coins, Activity, RefreshCw } from "lucide-react";
import { cn } from "../shared/index";
import { FLIGHT_WALLETS } from "./constants";

interface WalletSelectorModalProps {
    balances: Record<string, { sol: number, lxr: number, xls: number, usdx: number }>;
    showWalletSelector: "from" | "to";
    fromWallet: any;
    toWallet: any;
    setFromWallet: (wallet: any) => void;
    setToWallet: (wallet: any) => void;
    onClose: () => void;
}

export const WalletSelectorModal = ({
    balances,
    showWalletSelector,
    fromWallet,
    toWallet,
    setFromWallet,
    setToWallet,
    onClose
}: WalletSelectorModalProps) => {
    const [query, setQuery] = useState("");
    const filtered = FLIGHT_WALLETS.filter(w =>
        w.name.toLowerCase().includes(query.toLowerCase()) ||
        w.type.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-3xl rounded-[3rem] p-10 flex flex-col border border-white/10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h3 className="text-xl font-extralight text-white tracking-tighter">Fleet terminal</h3>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X className="w-5 h-5 text-white/40" /></button>
            </div>
            <div className="relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                    autoFocus
                    type="text"
                    placeholder="Search fleet unit designation..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:ring-1 focus:ring-blue-500/30 outline-none"
                />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {filtered.map((w, idx) => {
                    const b = balances[w.address];
                    const isSelected = (showWalletSelector === "from" ? fromWallet.address : toWallet.address) === w.address;
                    return (
                        <button
                            key={w.address + idx}
                            onClick={() => {
                                if (showWalletSelector === "from") setFromWallet(w);
                                else setToWallet(w);
                                onClose();
                            }}
                            className={cn(
                                "w-full p-6 rounded-[2rem] bg-white/[0.01] border transition-all flex items-center justify-between group text-left relative overflow-hidden",
                                isSelected ? "border-blue-500/40 bg-blue-500/5" : "border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all", isSelected ? "bg-blue-500/10 border-blue-500/20" : "bg-black/40 border-white/5")}>
                                    <Wallet className={cn("w-6 h-6", isSelected ? "text-blue-400" : "text-white/20")} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-base font-extralight text-white tracking-tighter">{w.name}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5"><Zap size={8} className="text-emerald-400" /><span className="text-[10px] text-white/40 font-mono">{b?.sol.toFixed(3) || "-"}</span></div>
                                        <div className="flex items-center gap-1.5"><Coins size={8} className="text-amber-400" /><span className="text-[10px] text-white/40 font-mono">{b?.lxr.toLocaleString() || "-"}</span></div>
                                        <div className="flex items-center gap-1.5"><Activity size={8} className="text-blue-400" /><span className="text-[10px] text-white/40 font-mono">{b?.xls.toLocaleString() || "-"}</span></div>
                                        <div className="flex items-center gap-1.5"><RefreshCw size={8} className="text-indigo-400" /><span className="text-[10px] text-white/40 font-mono">{b?.usdx.toLocaleString() || "-"}</span></div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
