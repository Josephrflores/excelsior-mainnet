
import React from "react";
import { Coins, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../shared/index";

interface LXRYieldProps {
    distributeAmount: string;
    setDistributeAmount: (amount: string) => void;
    status: string;
    message: string;
    handleDistribute: () => void;
}

export const LXRYield = ({ distributeAmount, setDistributeAmount, status, message, handleDistribute }: LXRYieldProps) => {
    return (
        <motion.div
            key="yield"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
        >
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                    <Coins className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-light text-white tracking-tight">LXR Yield Distribution</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">Admin Control Panel</p>
                </div>
            </div>

            <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-white">Protocol Warning</h4>
                        <p className="text-xs text-white/60 leading-relaxed">
                            You are about to distribute LXR tokens from your admin wallet to the staking contract.
                            This action is irreversible and uses the 60/40 logic defined in the smart contract.
                            Ensure you have sufficient LXR balance.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-10 border border-white/5 bg-white/[0.01] rounded-3xl space-y-8 max-w-2xl">
                <div className="space-y-4">
                    <label className="text-xs text-white/60 font-medium tracking-wide">AMOUNT TO DISTRIBUTE (LXR)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/20 text-[10px] font-bold">LXR</div>
                        <input
                            type="number"
                            value={distributeAmount}
                            onChange={(e) => setDistributeAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-white/20 transition-all font-mono"
                        />
                    </div>
                </div>
                <button
                    onClick={handleDistribute}
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg"
                >
                    {status === 'loading' ? "Processing..." : "Execute Distribution"}
                </button>

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
