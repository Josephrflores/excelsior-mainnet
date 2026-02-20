import React from "react";
import { Landmark, ShieldCheck, Activity, Lock } from "lucide-react";

export const GovernanceReport = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-purple-500" />
                    Governance & Treasury Distribution
                </h3>
                <p className="text-white/60 text-sm max-w-2xl">
                    Detailed breakdown of Fee Distribution, Rental Income splits, and Vault assignments.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Fees */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-4">Fee Distribution (100% Model)</h4>
                    <p className="text-sm text-white/40 mb-6">Fees are NO LONGER burned. They are distributed fully.</p>

                    <div className="space-y-6">
                        <div className="relative pt-6">
                            <div className="absolute top-0 left-0 text-xs text-purple-400 font-bold uppercase tracking-widest">Excelsior Value Growth</div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm">Ensures perpetual value growth of XLS.</span>
                                <span className="text-purple-400 font-mono font-bold text-xl">30%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[30%]" />
                            </div>
                        </div>

                        <div className="relative pt-6">
                            <div className="absolute top-0 left-0 text-xs text-blue-400 font-bold uppercase tracking-widest">Stablecoin Reserve</div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm">Collateral for USDX creation.</span>
                                <span className="text-blue-400 font-mono font-bold text-xl">30%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[30%]" />
                            </div>
                        </div>

                        <div className="relative pt-6">
                            <div className="absolute top-0 left-0 text-xs text-amber-400 font-bold uppercase tracking-widest">Founder/Personal Rewards</div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm">Direct rewards for creator.</span>
                                <span className="text-amber-400 font-mono font-bold text-xl">40%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[40%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h4 className="text-lg font-bold text-white mb-4">Security Parameters</h4>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <div className="p-2 rounded bg-emerald-500/10 text-emerald-500">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">Multisig Requirement</div>
                                <div className="text-white/40 text-xs">2 of 3 Signatures (Admin, Ops, Founder)</div>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">Oracles</div>
                                <div className="text-white/40 text-xs">Pyth (Primary) + Chainlink (Fallback)</div>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="p-2 rounded bg-amber-500/10 text-amber-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">Timelock</div>
                                <div className="text-white/40 text-xs">48 Hours for Protocol Upgrades</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Rental Income */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h4 className="font-bold text-white">Rental Income Distribution</h4>
                    <span className="text-xs text-white/40 uppercase">Recurring Revenue Split</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-white/10 border-b border-white/10 bg-white/[0.02]">
                    <div className="p-4 text-center">
                        <div className="text-2xl font-mono text-white mb-1">20%</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest">RWA Vault</div>
                        <div className="text-[10px] text-white/30 mt-1">New Properties</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-2xl font-mono text-white mb-1">10%</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest">Buyback</div>
                        <div className="text-[10px] text-white/30 mt-1">Floor Protection</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-2xl font-mono text-white mb-1">10%</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest">Data Center</div>
                        <div className="text-[10px] text-white/30 mt-1">Infra Expansion</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-2xl font-mono text-white mb-1">10%</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest">Energy Grid</div>
                        <div className="text-[10px] text-white/30 mt-1">Energy Infra</div>
                    </div>
                </div>
                <div className="bg-white/[0.01] p-4 text-center text-xs text-white/40">
                    Remaining 40% distributed between Founder Vault, Locked Ops, Locked Holding, and Community Funds (10% each).
                </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-blue-400 mb-2">Multisig Infrastructure</h4>
                <p className="text-sm text-white/70 mb-4">
                    Critical functions (Mint, Withdraw, Freeze) are protected by a <strong>2-of-3 Multisig</strong> (Squads).
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white">ADMIN (Tech)</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white">GENESIS (Root)</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white">OPERATIONS (Biz)</span>
                </div>
            </div>
        </div>
    );
};
