
import React from "react";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface XLSStakingProps {
    stakeAmount: string;
    setStakeAmount: (amount: string) => void;
    status: string;
    message: string;
    handleStake: (action: 'deposit' | 'withdraw') => void;
}

export const XLSStaking = ({ stakeAmount, setStakeAmount, status, message, handleStake }: XLSStakingProps) => {
    return (
        <motion.div
            key="staking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
        >
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tight">XLS Staking</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">Lock XLS to earn LXR Yield</p>
                </div>
            </div>

            <div className="p-10 border border-white/5 bg-white/[0.01] rounded-3xl space-y-8 max-w-2xl">
                <div className="space-y-4">
                    <label className="text-xs text-white/60 font-medium tracking-wide">STAKE AMOUNT (XLS)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/20 text-[10px] font-bold">XLS</div>
                        <input
                            type="number"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-white/20 transition-all font-mono"
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleStake('deposit')}
                        disabled={status === 'loading'}
                        className="flex-1 py-4 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg"
                    >
                        Deposit Stake
                    </button>
                    <button
                        onClick={() => handleStake('withdraw')}
                        disabled={status === 'loading'}
                        className="flex-1 py-4 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                    >
                        Unknown Withdraw
                    </button>
                </div>

                {status !== 'idle' && (
                    <div className={cn(
                        "p-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2",
                        status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
