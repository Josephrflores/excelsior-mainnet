"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProtocol, cn } from "../shared/index";

interface PriceData {
    price: number;
    change24h?: number;
    lastUpdated: number;
}

export const PriceFeed = () => {
    const { config } = useProtocol();
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [loading, setLoading] = useState(true);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            // Mapping of our tokens to their mints in the current environment
            const tokens = [
                { id: "LXR", mint: config.lxrMint.toString() },
                { id: "XLS", mint: config.xlsMint.toString() },
                { id: "USDX", mint: config.usdxMint.toString() }
            ];

            const mints = tokens.map(t => t.mint).join(",");
            const response = await fetch(`https://api.jup.ag/price/v2?ids=${mints}`);
            const data = await response.json();

            const newPrices: Record<string, PriceData> = {};
            tokens.forEach(token => {
                const priceInfo = data.data[token.mint];
                if (priceInfo) {
                    newPrices[token.id] = {
                        price: parseFloat(priceInfo.price),
                        lastUpdated: Date.now()
                    };
                } else {
                    // Fallback to mock/0 if not found (especially on devnet)
                    newPrices[token.id] = {
                        price: token.id === "USDX" ? 1.00 : 0.00,
                        lastUpdated: Date.now()
                    };
                }
            });

            setPrices(newPrices);
        } catch (error) {
            console.error("Error fetching prices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, [config]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-medium text-white">Live Market Prices</h3>
                    <p className="text-xs text-white/40">Aggregated via Jupiter (Real-time)</p>
                </div>
                <button
                    onClick={fetchPrices}
                    className="p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
                >
                    <RefreshCw size={14} className={cn("text-white/40 group-hover:text-white", loading && "animate-spin")} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["LXR", "XLS", "USDX"].map((symbol) => (
                    <motion.div
                        key={symbol}
                        whileHover={{ y: -4 }}
                        className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{symbol}</span>
                            <a
                                href={`https://birdeye.so/token/${(config as any)[symbol.toLowerCase() + "Mint"]?.toString()}?chain=solana`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/10 hover:text-white/40 transition-colors"
                            >
                                <ExternalLink size={12} />
                            </a>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <h4 className="text-2xl text-white font-medium tracking-tight">
                                ${prices[symbol]?.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </h4>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                                LIVE
                            </div>
                            <span className="text-[9px] text-white/20 font-mono">
                                Updated {Math.floor((Date.now() - (prices[symbol]?.lastUpdated || Date.now())) / 1000)}s ago
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
