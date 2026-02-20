
import { Zap, Coins, Activity, RefreshCw } from "lucide-react";
import walletsData from "@/lib/wallet-addresses.json";

export const FLIGHT_WALLETS = (walletsData || []).map(w => ({
    name: w.name,
    address: w.address,
    type: w.type,
    isFounder: w.type === "Founder" || w.type === "Founders",
    shortAddress: `${w.address.slice(0, 6)}...${w.address.slice(-6)}`
}));

export const ASSETS = [
    { id: "sol", symbol: "SOL", name: "Solana", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "lxr", symbol: "LXR", name: "Luxor", icon: Coins, color: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "xls", symbol: "XLS", name: "Excelsior", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "usdx", symbol: "USDX", name: "USDX", icon: RefreshCw, color: "text-indigo-400", bg: "bg-indigo-500/10" },
];
