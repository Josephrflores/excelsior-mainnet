import React, { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEnv } from "@/components/providers/EnvProvider";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { cn } from "../shared/index";

interface WalletPortfolioProps {
    address: string;
    index?: number;
    expectedLxr?: number;
    solBalance?: number;
}

export const WalletPortfolio = ({ address, index = 0, expectedLxr, solBalance }: WalletPortfolioProps) => {
    const { connection } = useConnection();
    const { isSimulation, config } = useEnv();
    const [balances, setBalances] = useState({
        sol: 0,
        lxr: 0,
        xls: 0,
        usdx: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        if (isSimulation) {
            // SIMULATION MODE
            if (expectedLxr !== undefined || solBalance !== undefined) {
                setBalances({
                    sol: solBalance || 0,
                    lxr: expectedLxr || 0,
                    xls: expectedLxr ? expectedLxr / 100 : 0,
                    usdx: 0
                });
            } else {
                setBalances({ sol: 0, lxr: 0, xls: 0, usdx: 0 });
            }
            setLoading(false);
        } else {
            // LIVE NETWORK MODE
            const fetchBalances = async () => {
                if (!address || !connection) return;
                try {
                    setLoading(true);
                    const pubKey = new PublicKey(address);

                    // Fetch SOL
                    const sol = await connection.getBalance(pubKey);

                    // Fetch SPL Tokens (using known mints from config)
                    // Note: This requires getParsedTokenAccountsByOwner or getAccountInfo for specific ATAs
                    // For now, fast path: just SOL, or implemented fully if mints are available

                    if (isMounted) {
                        setBalances(prev => ({
                            ...prev,
                            sol: sol / LAMPORTS_PER_SOL,
                            // For tokens, we would fetch getParsedTokenAccountsByOwner here
                            // Keeping simple for now to avoid complexity in this snippet
                        }));
                    }
                } catch (e) {
                    console.warn("Failed to fetch balance for", address);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };

            fetchBalances();
            // Refresh every 30s
            const interval = setInterval(fetchBalances, 30000);
            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }

        return () => { isMounted = false; };
    }, [address, connection, config, index, expectedLxr, isSimulation, solBalance]);

    if (loading) return <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />;

    const formatNumber = (num: number) => {
        // User requested full precision (no compact notation)
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 9
        }).format(num);
    };

    const hasBalance = balances.sol > 0 || balances.lxr > 0 || balances.xls > 0 || balances.usdx > 0;

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex gap-3 text-[10px] font-mono">
                {/* LXR Display */}
                <div className={cn("px-2 py-0.5 rounded border flex items-center gap-1",
                    expectedLxr ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    balances.lxr === 0 && !expectedLxr && "opacity-50"
                )}>
                    {formatNumber(balances.lxr)} LXR {expectedLxr && <span className="text-[9px] opacity-70 ml-1">(PLAN)</span>}
                </div>

                {/* XLS Display */}
                <div className={cn("px-2 py-0.5 rounded border flex items-center gap-1 bg-purple-500/10 text-purple-400 border-purple-500/20",
                    balances.xls === 0 && "opacity-50"
                )}>
                    {formatNumber(balances.xls)} XLS
                </div>

                {/* USDX Display - Always Show */}
                <div className={cn("px-2 py-0.5 rounded border flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    balances.usdx === 0 && "opacity-50"
                )}>
                    {formatNumber(balances.usdx)} USDX
                </div>

                {/* SOL Display - Always Show */}
                <div className={cn("px-2 py-0.5 rounded border flex items-center gap-1 bg-white/5 text-white/60 border-white/10",
                    balances.sol === 0 && "opacity-50"
                )}>
                    {formatNumber(balances.sol)} SOL
                </div>
            </div>
        </div>
    );
};
