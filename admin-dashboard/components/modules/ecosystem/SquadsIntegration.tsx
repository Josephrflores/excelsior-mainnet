"use client";

import React from "react";
import { ShieldCheck, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useProtocol, cn } from "../shared/index";

export const SquadsIntegration = () => {
    const { config } = useProtocol();

    // Mock data for pending transactions if SDK is not initialized
    const pendingProposals = [
        { id: 1, title: "Rebalance Treasury to Ops", amount: "500,000 LXR", status: "1/3 Signed", time: "2h ago" },
        { id: 2, title: "Update Global Fee BPS", amount: "Instruction", status: "0/3 Signed", time: "5h ago" }
    ];

    const squadsLink = `${config.squadsDashboardUrl}${config.multisigAddress.toString()}`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-medium text-white">Squads Multisig Control</h3>
                    <p className="text-xs text-white/40">Professional Custody & Governance</p>
                </div>
                <a
                    href={squadsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    Open Squads App
                    <ExternalLink size={12} />
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Multisig Status Card */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Multisig Configuration</h3>
                            <p className="text-[10px] text-white/40 font-mono break-all">{config.multisigAddress.toString()}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60">Threshold</span>
                            <span className="text-xs text-white font-bold">2 of 3 Members</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs text-white/60">Stage Instance</span>
                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">{config.name}</span>
                        </div>
                    </div>
                </div>

                {/* Pending Proposals Card */}
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Pending Proposals</h3>
                            <p className="text-xs text-white/40">Action required by partners</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {pendingProposals.map((prop) => (
                            <div key={prop.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-medium text-white">{prop.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-white/20 font-mono">{prop.amount}</span>
                                        <span className="text-[9px] text-blue-400 font-bold">{prop.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-white/20">{prop.time}</span>
                                    <AlertCircle size={12} className="text-amber-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-xs text-blue-300 text-center">
                    Note: Your private keys never leave Phantom. The Dashboard only proposes actions to the Multisig vault.
                </p>
            </div>
        </div>
    );
};
