import React from "react";
import { Scroll, Lock, Activity } from "lucide-react";

export const ConstitutionReport = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-amber-500" />
                    Operational Constitution & Isolation Philosophy
                </h3>
                <p className="text-white/60 text-sm max-w-4xl">
                    This guide is the "Constitution" of the Dashboard. It strictly details what actions are possible in each network and how the system manages these capabilities to guarantee security and order.
                    The Dashboard changes its behavior based on the selected "Workspace" (Network).
                </p>
            </div>

            {/* Network Roles */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-emerald-400 font-bold mb-1">Production Source</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Role: Architect</div>
                    <p className="text-xs text-white/70">
                        <strong>Total Simulation.</strong> See the perfect plan.
                        <br />Risk: <span className="text-emerald-400">Null (Illusion)</span>
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-white font-bold mb-1">Devnet</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Role: God Mode</div>
                    <p className="text-xs text-white/70">
                        <strong>Create, Destroy, Reset.</strong> Faucets enabled.
                        <br />Risk: <span className="text-white">Low (Laboratory)</span>
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-amber-400 font-bold mb-1">Testnet</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Role: Pilot</div>
                    <p className="text-xs text-white/70">
                        <strong>Rehearsal.</strong> Test Upgrades & Multisig flows.
                        <br />Risk: <span className="text-amber-400">Medium (Drill)</span>
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-red-500 font-bold mb-1">Mainnet</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Role: President</div>
                    <p className="text-xs text-white/70">
                        <strong>Governance Only.</strong> Propose Changes.
                        <br />Risk: <span className="text-red-500 font-bold">HIGH (Real Money)</span>
                    </p>
                </div>
            </div>

            {/* Matrix */}
            <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Capability Matrix by Token</h4>

                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 font-bold text-amber-500 text-sm">
                        LXR (Master Token) - Base of the Economy
                    </div>
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-white/[0.02] text-white/40">
                            <tr>
                                <th className="p-3">Action</th>
                                <th className="p-3">Prod. Source</th>
                                <th className="p-3">Devnet</th>
                                <th className="p-3">Testnet</th>
                                <th className="p-3">Mainnet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                            <tr>
                                <td className="p-3 font-medium">Mint (Inflation)</td>
                                <td className="p-3 text-white/40">Simulated</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-amber-400">Multisig</td>
                                <td className="p-3 text-red-500 font-bold"><Lock className="w-3 h-3 inline mr-1" /> Multisig</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Burn (Deflation)</td>
                                <td className="p-3 text-white/40">Simulated</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Freeze Account</td>
                                <td className="p-3 text-red-500/20">-</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-amber-400">Multisig</td>
                                <td className="p-3 text-red-500 font-bold"><Lock className="w-3 h-3 inline mr-1" /> Multisig</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 font-bold text-white text-sm">
                        XLS (Shares) - Security & Voting
                    </div>
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-white/[0.02] text-white/40">
                            <tr>
                                <th className="p-3">Action</th>
                                <th className="p-3">Prod. Source</th>
                                <th className="p-3">Devnet</th>
                                <th className="p-3">Testnet</th>
                                <th className="p-3">Mainnet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                            <tr>
                                <td className="p-3 font-medium">Distribute Dividends</td>
                                <td className="p-3 text-white/40">Simulated</td>
                                <td className="p-3 text-emerald-400">Script</td>
                                <td className="p-3 text-emerald-400">Script</td>
                                <td className="p-3 text-blue-400 font-bold"><Activity className="w-3 h-3 inline mr-1" /> Auto</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Issue Shares</td>
                                <td className="p-3 text-white/40">Simulated</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-amber-400">Vote</td>
                                <td className="p-3 text-red-500 font-bold"><Lock className="w-3 h-3 inline mr-1" /> DAO Vote</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 font-bold text-blue-500 text-sm">
                        USDX (Stablecoin) - Stability
                    </div>
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-white/[0.02] text-white/40">
                            <tr>
                                <th className="p-3">Action</th>
                                <th className="p-3">Prod. Source</th>
                                <th className="p-3">Devnet</th>
                                <th className="p-3">Testnet</th>
                                <th className="p-3">Mainnet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                            <tr>
                                <td className="p-3 font-medium">Adjust Fees</td>
                                <td className="p-3 text-white/40">Simulated</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-amber-400">Multisig</td>
                                <td className="p-3 text-red-500 font-bold"><Lock className="w-3 h-3 inline mr-1" /> Multisig</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Change Oracles</td>
                                <td className="p-3 text-white/40">Simulated</td>
                                <td className="p-3 text-emerald-400">Direct</td>
                                <td className="p-3 text-amber-400">Multisig</td>
                                <td className="p-3 text-red-500 font-bold"><Lock className="w-3 h-3 inline mr-1" /> Multisig</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <h4 className="text-lg font-bold text-white mb-2">Upgrade Procedure (Mainnet)</h4>
                <p className="text-white/60 text-sm mb-4">
                    In Solana Mainnet, code is NOT changed "hot".
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-white/80 font-mono">
                    <li><span className="text-amber-500">Proposal:</span> Dashboard compiles new buffer & creates DAO proposal.</li>
                    <li><span className="text-amber-500">Review:</span> 24-48h Timelock for audit.</li>
                    <li><span className="text-amber-500">Execution:</span> If Multisig approves (M of N), program updates atomically.</li>
                </ol>
            </div>
        </div>
    );
};
