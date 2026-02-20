
import React from "react";
import { ShieldHalf, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface RiskControlsProps {
    config: any;
    withdrawAmount: string;
    setWithdrawAmount: (amount: string) => void;
    withdrawBeneficiary: string;
    setWithdrawBeneficiary: (beneficiary: string) => void;
    withdrawalRequests: any[];
    handleRequestWithdrawal: () => void;
    handleExecuteWithdrawal: (publickey: any, req: any) => void;
    status: string;
}

export const RiskControls = ({
    config,
    withdrawAmount,
    setWithdrawAmount,
    withdrawBeneficiary,
    setWithdrawBeneficiary,
    withdrawalRequests,
    handleRequestWithdrawal,
    handleExecuteWithdrawal,
    status
}: RiskControlsProps) => {
    return (
        <motion.div
            key="risk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-12"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">Risk Controls</h1>

            <div className="p-10 border border-red-500/10 bg-red-500/[0.02] rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                            <ShieldHalf className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-medium text-white tracking-tight">Reserve Protection</h3>
                            <p className="text-[10px] text-white/60 font-bold tracking-[0.2em] mt-1">WITHDRAWAL LIMITS</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-white font-bold mb-1 uppercase tracking-widest">Daily Cap (1%)</p>
                                <p className="text-2xl font-light text-white tracking-tight">
                                    {config ? (config.dailyWithdrawalAmount / 1e9).toLocaleString() : "0"} / 1,000,000 <span className="text-sm text-white/20">LXR</span>
                                </p>
                            </div>
                            <span className="text-[10px] text-[#1a73e8] font-bold">0.8% Used</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#1a73e8] h-full w-[8%]" />
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Initiate Withdrawal Request</p>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Amount (LXR)"
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/10 transition-all font-mono"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Beneficiary Address (Optional)"
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/10 transition-all font-mono"
                                value={withdrawBeneficiary}
                                onChange={(e) => setWithdrawBeneficiary(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleRequestWithdrawal}
                            disabled={status === 'loading'}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Request (24h Lock)
                        </button>
                    </div>

                    {/* Pending Requests List */}
                    <div className="space-y-4">
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest px-1">Pending Time-locks</p>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                            {withdrawalRequests.length > 0 ? withdrawalRequests.map((req, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <Clock size={14} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{(req.amount / 1e9).toLocaleString()} LXR</p>
                                            <p className="text-[9px] text-white/20 mt-0.5">Unlock: {new Date(req.unlockAt * 1000).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleExecuteWithdrawal(req.publickey, req)}
                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all rounded-lg text-[9px] font-bold uppercase border border-emerald-500/20"
                                    >
                                        Execute
                                    </button>
                                </div>
                            )) : (
                                <div className="h-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-40">
                                    <p className="text-[10px] font-medium text-white/60">No pending time-locks</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
