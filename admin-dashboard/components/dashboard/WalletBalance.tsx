"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState, useMemo } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LXR_MINT, XLS_MINT } from "../modules/shared";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { Coins, Flame, Wallet as WalletIcon, RefreshCw } from "lucide-react";



export default function WalletBalance() {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [balances, setBalances] = useState({ sol: 0, lxr: 0, xls: 0 });
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchBalances = useMemo(() => async () => {
        if (!publicKey || !connected) return;
        setLoading(true);
        try {
            const solBalance = await connection.getBalance(publicKey);

            let lxrVal = 0;
            try {
                const lxrAta = getAssociatedTokenAddressSync(LXR_MINT, publicKey, false, TOKEN_2022_PROGRAM_ID);
                const account = await getAccount(connection, lxrAta, "confirmed", TOKEN_2022_PROGRAM_ID);
                lxrVal = Number(account.amount) / 1e9;
            } catch (e) { }

            let xlsVal = 0;
            try {
                const xlsAta = getAssociatedTokenAddressSync(XLS_MINT, publicKey, false, TOKEN_2022_PROGRAM_ID);
                const account = await getAccount(connection, xlsAta, "confirmed", TOKEN_2022_PROGRAM_ID);
                xlsVal = Number(account.amount) / 1e9;
            } catch (e) { }

            setBalances({
                sol: solBalance / LAMPORTS_PER_SOL,
                lxr: lxrVal,
                xls: xlsVal
            });
        } catch (error) {
            console.error("Error fetching wallet balances:", error);
        } finally {
            setLoading(false);
        }
    }, [publicKey, connected, connection]);

    useEffect(() => {
        fetchBalances();
        const id = setInterval(fetchBalances, 30000); // Auto-refresh every 30s
        return () => clearInterval(id);
    }, [fetchBalances]);

    if (!mounted) return null;

    if (!connected) {
        return (
            <div className="space-y-4 pb-4">
                <p className="text-[11px] text-white/20 font-medium tracking-tight">Status: Disconnected</p>
                <WalletMultiButton className="!bg-white !text-black !rounded-full !h-9 !text-[11px] !font-medium !tracking-tight !w-full border-none shadow-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <p className="text-[11px] text-white/40 font-medium tracking-tight">Node online</p>
                <button onClick={fetchBalances} className="text-white/20 hover:text-white transition-colors">
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/20 font-medium tracking-tight">Sol balance</span>
                    <span className="text-xl font-medium text-white tracking-tight tabular-nums">{balances.sol.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/20 font-medium tracking-tight">Luxor assets (LXR)</span>
                    <span className="text-xl font-medium text-white tracking-tight tabular-nums">{balances.lxr.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/20 font-medium tracking-tight">Excelsior reserve (XLS)</span>
                    <span className="text-xl font-medium text-white tracking-tight tabular-nums">{balances.xls.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div className="pt-2">
                <WalletMultiButton className="!bg-transparent !h-6 !text-[10px] !px-0 !border-none !rounded-none !text-white/20 hover:!text-white !font-medium !tracking-tight !shadow-none !justify-start transition-all" />
            </div>
        </div>
    );
}
