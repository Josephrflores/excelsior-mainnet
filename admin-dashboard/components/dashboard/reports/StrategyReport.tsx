import React from "react";
import { Activity, Lock, ShieldCheck } from "lucide-react";

export const StrategyReport = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-500" />
                    Strategic Technical Report: Excelsior Ecosystem
                </h3>
                <p className="text-white/60 text-sm max-w-4xl">
                    Definitive economic architecture, governance system, and asset distribution for the official launch.
                    Audited and verified v1.2.
                </p>
            </div>

            {/* Currencies */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-amber-500 font-bold border-b border-amber-500/20 pb-2">Luxor (LXR) Specs</h4>
                    <ul className="space-y-3 text-sm text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Supply</span>
                            <span className="font-mono text-white">2,025,000,000</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Precision</span>
                            <span className="font-mono text-white">9 Decimals</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Inflation</span>
                            <span className="font-mono text-white">2.5% / 5 Years</span>
                        </li>
                        <li className="text-xs text-white/50 pt-2">
                            Distribution: 60% Reserve, 20% Holding, 10% Operations, 10% Founder.
                        </li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-white font-bold border-b border-white/20 pb-2">Excelsior (XLS) Specs</h4>
                    <ul className="space-y-3 text-sm text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Max Cap</span>
                            <span className="font-mono text-white">20,250,000</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Backing</span>
                            <span className="font-mono text-white">RWA (Real World Assets)</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Emission</span>
                            <span className="font-mono text-red-400">Strictly Limited</span>
                        </li>
                        <li className="text-xs text-white/50 pt-2">
                            Locked emission on Mainnet. Minting only possible via RWA Vault deposit.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Economic Model */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
                <h4 className="text-xl font-bold text-white">Economic Model: Fixed Entry / Dynamic Floor</h4>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h5 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-widest">Hard-Peg Entry</h5>
                        <div className="text-white/70 text-sm leading-relaxed">
                            Emission of 1 XLS has an immutable cost of <strong>1,000,000 LXR</strong>.
                            This standardizes cost of capital regardless of market volatility. Meaning:
                            <span className="block mt-2 font-mono bg-black/20 p-2 rounded text-emerald-300">
                                1 XLS = 1,000,000 LXR (LOCKED)
                            </span>
                        </div>
                    </div>
                    <div>
                        <h5 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-widest">Dynamic Floor Exit</h5>
                        <div className="text-white/70 text-sm leading-relaxed">
                            Redemption is protected by a Dynamic Floor Price.
                            Formula ensures holders can always recover intrinsic RWA value.
                            <div className="mt-2 text-xs font-mono bg-black/20 p-2 rounded text-blue-300 overflow-x-auto">
                                Redeem = MAX(700,000 LXR, (RWA_Value_USD / LXR_Price_USD))
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Report */}
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Security Audit: Code Certified
                </h4>
                <div className="grid gap-4 text-sm">
                    <div className="flex gap-4">
                        <div className="min-w-[4px] bg-emerald-500/50 rounded-full" />
                        <div>
                            <strong className="text-white block">Value Engineering ("Mint-by-Lock")</strong>
                            <p className="text-white/60">IMPLEMENTED in <code>swap.rs</code>. LXR are NOT burned, they are LOCKED in Reserve Vault. In-line with "Immutable Backing" promise.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="min-w-[4px] bg-emerald-500/50 rounded-full" />
                        <div>
                            <strong className="text-white block">Oracle Resilience</strong>
                            <p className="text-white/60">HARDENED in <code>oracle_utils.rs</code>. Added check for negative prices. Auto-fallback from Pyth to Chainlink confirmed.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="min-w-[4px] bg-emerald-500/50 rounded-full" />
                        <div>
                            <strong className="text-white block">Anti-Flash Loan Protection</strong>
                            <p className="text-white/60">SECURE. <code>distribute_rent</code> is asynchronous and volume-based, not spot-price based. Immuned to flash loan attacks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
