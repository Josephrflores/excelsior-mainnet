
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface GovernanceProps {
    stakingStats: {
        totalStaked: number;
        tempApy: number;
        stakersCount: number;
        myStake: number;
    };
    govStats: {
        votingPower: number;
        activeProposals: number;
        participationRate: string;
    };
}

export const Governance = ({ stakingStats, govStats }: GovernanceProps) => {
    return (
        <motion.div
            key="governance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 w-full"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-white tracking-tight">Protocol Governance</h1>
                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">My Voting Power</p>
                        <p className="text-xl font-light text-white tracking-tighter mt-1">{stakingStats.myStake > 0 ? (stakingStats.myStake * 1.5).toLocaleString() : '0'} <span className="text-xs text-white/40">veXLS</span></p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Delegated</p>
                        <p className="text-xl font-light text-white tracking-tighter mt-1">0 <span className="text-xs text-white/40">veXLS</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Proposals */}
                <div className="space-y-6">
                    <h3 className="text-xl font-light text-white">Active Proposals</h3>

                    {[
                        { id: "PIP-12", title: "Adjust LXR Inflation Target to 2.8%", status: "Active", ends: "2 days", votes: { yes: 78, no: 22 } },
                        { id: "PIP-13", title: "Add New Collateral Type (SOL) for USDX", status: "Active", ends: "4 days", votes: { yes: 95, no: 5 } },
                    ].map((prop, i) => (
                        <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/5 transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">{prop.status}</span>
                                        <span className="text-xs text-white/40 font-mono">{prop.id}</span>
                                    </div>
                                    <h4 className="text-lg font-medium text-white">{prop.title}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ends In</p>
                                    <p className="text-sm text-white font-mono">{prop.ends}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                    <span className="text-emerald-400">Yes {prop.votes.yes}%</span>
                                    <span className="text-red-400">{prop.votes.no}% No</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-emerald-500" style={{ width: `${prop.votes.yes}%` }} />
                                    <div className="h-full bg-red-500" style={{ width: `${prop.votes.no}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity / History */}
                <div className="space-y-6">
                    <h3 className="text-xl font-light text-white">Voting History</h3>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-full">
                        <div className="space-y-4">
                            {[
                                { id: "PIP-10", title: "Treasury Diversification", vote: "Yes", result: "Passed" },
                                { id: "PIP-09", title: "Update Fee Switch", vote: "Yes", result: "Passed" },
                                { id: "PIP-08", title: "Emergency Pause Protocol", vote: "No", result: "Rejected" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-xs font-medium text-white">{item.title}</p>
                                        <p className="text-[10px] text-white/40 font-mono mt-0.5">{item.id} • You voted: <span className={item.vote === 'Yes' ? 'text-emerald-400' : 'text-red-400'}>{item.vote}</span></p>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                                        item.result === 'Passed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                        {item.result}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
