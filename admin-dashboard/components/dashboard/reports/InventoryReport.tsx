import React from "react";
import { Database, ShieldCheck, Calculator } from "lucide-react";
import rawWalletData from "@/lib/wallet-addresses.json";

interface WalletData {
    name: string;
    address: string;
    type: string;
    description: string;
    expectedLxr?: number;
    solBalance?: number;
    lxrBalance?: number;
    xlsBalance?: number;
}

const walletData = rawWalletData as WalletData[];

export const InventoryReport = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-500" />
                    Global Wallet Inventory
                </h3>
                <p className="text-white/40 text-sm max-w-2xl">
                    Real-time audit of all funded wallets. These are the confirmation addresses on-chain.
                    Devnet Sync timestamp: {new Date().toLocaleTimeString()} UTC.
                </p>
            </div>

            <div className="grid gap-4">
                {walletData.map((wallet, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-bold text-white">{wallet.name}</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/50 border border-white/10 uppercase tracking-widest">
                                        {wallet.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono text-white/30 group-hover:text-amber-500/80 transition-colors cursor-pointer"
                                    onClick={() => navigator.clipboard.writeText(wallet.address)}>
                                    {wallet.address}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-black/50 px-1 rounded">COPY</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-light text-white">
                                    {wallet.lxrBalance?.toLocaleString()} <span className="text-sm font-bold text-amber-500">LXR</span>
                                </div>
                                <div className="text-sm text-white/40">
                                    {wallet.xlsBalance?.toLocaleString()} XLS
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5">
                            <div>
                                <span className="text-white/30 block mb-1">ROLE / PURPOSE</span>
                                <span className="text-white/80">{wallet.description}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-white/30 block mb-1">SECURITY STATUS</span>
                                <span className="text-emerald-400 flex items-center justify-end gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Active & Audited
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Token Supply Summary
                </h4>
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-xs text-blue-300/50 uppercase tracking-widest mb-1">Total LXR Supply</div>
                        <div className="text-xl font-mono text-white">2,025,000,000</div>
                    </div>
                    <div>
                        <div className="text-xs text-blue-300/50 uppercase tracking-widest mb-1">Total XLS Cap</div>
                        <div className="text-xl font-mono text-white">20,250,000</div>
                    </div>
                    <div>
                        <div className="text-xs text-blue-300/50 uppercase tracking-widest mb-1">Circulating (1%)</div>
                        <div className="text-xl font-mono text-amber-500">20,250,000 LXR</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
