"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { RefreshCw, AlertCircle, Eye, EyeOff, Edit2, Shield, Zap, Coins, Activity, Check, Plus, Trash2, Wallet, Key } from "lucide-react";
import { cn, LXR_MINT, XLS_MINT } from "../modules/shared";

// Premium styles for WalletGrid
const cardStyle = "bg-[#0f0f12] border border-white/5 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group";
const innerCardStyle = "relative z-10 p-8";

// Types corresponding to our JSON
interface WalletInfo {
    name: string;
    address: string;
    type: "Founders" | "Master" | "Rewards" | "Assets" | "Fees" | "Holding" | "Dead";
    description?: string;
    isFounder?: boolean;
    isGenesis?: boolean;
    genesisFor?: string[];
    protocolData?: {
        feeRate?: string;
        authority?: string;
        activeSince?: string;
    };
}



interface WalletBalance {
    sol: number;
    lxr: number;
    xls: number;
}

const founderAddresses = [
    "6HTDhYBmSU5Ei2MKG9Zg7WBYnJWX8Q87DvGpfcFAt9ko", // master_personal (Genesis Root)
    "FC6ZGDNiXiLcdUb4c6VGqtAoP1Dx5PaUtFVu1oNEunX7", // Founder Lock
    "B4oFz3PjG8psJsZotesJmT9W33Qz3fzYY2NWkvUjcTRF", // master_operations
    "9vH4YyXrCAFe47eQ5pKn9tHkmU7SWJg5z84TUamLRdKA", // master_holding
    "7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk", // Admin
    "7za4bCkZAzkVxaJrfH7iP1NetETqsp6iPe9GN9jtu4UG"  // Roosevelt Personal (1%)
];

export default function WalletGrid({ wallets }: { wallets: WalletInfo[] }) {
    const [balances, setBalances] = useState<Record<string, WalletBalance>>({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastGenerated, setLastGenerated] = useState<{ address: string, secret: string } | null>(null);

    // UI States
    const [visibleAddresses, setVisibleAddresses] = useState<Set<string>>(new Set());
    const [customNames, setCustomNames] = useState<Record<string, string>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState("");
    const [activeTab, setActiveTab] = useState<WalletInfo["type"]>("Founders");
    const [founderWallets, setFounderWallets] = useState<Set<string>>(new Set());
    const [categoryOverrides, setCategoryOverrides] = useState<Record<string, WalletInfo["type"]>>({});
    const [customWallets, setCustomWallets] = useState<WalletInfo[]>([]);

    // Add Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newAddress, setNewAddress] = useState("");

    const generateNewKeypair = () => {
        const kp = Keypair.generate();
        setNewAddress(kp.publicKey.toBase58());
        const secretString = `[${kp.secretKey.toString()}]`;
        setLastGenerated({ address: kp.publicKey.toBase58(), secret: secretString });
        setNewName(`Fleet Unit ${customWallets.length + 1}`);
    };

    // Load states from local storage on mount
    useEffect(() => {
        const storedNames = localStorage.getItem("excelsior_wallet_names");
        if (storedNames) setCustomNames(JSON.parse(storedNames));

        const storedFounders = localStorage.getItem("excelsior_founder_wallets");
        if (storedFounders) setFounderWallets(new Set(JSON.parse(storedFounders)));

        const storedOverrides = localStorage.getItem("excelsior_wallet_categories");
        if (storedOverrides) setCategoryOverrides(JSON.parse(storedOverrides));

        const storedCustom = localStorage.getItem("excelsior_custom_wallets");
        if (storedCustom) setCustomWallets(JSON.parse(storedCustom));
    }, []);

    const addWallet = () => {
        if (!newName || !newAddress) return;

        try {
            new PublicKey(newAddress);
        } catch (e) {
            setError("Invalid Solana Address. Please verify the base-58 string.");
            return;
        }

        const newWallet: WalletInfo = {
            name: newName,
            address: newAddress,
            type: activeTab,
            description: "Account created manually via Dashboard."
        };
        const updated = [...customWallets, newWallet];
        setCustomWallets(updated);
        localStorage.setItem("excelsior_custom_wallets", JSON.stringify(updated));

        setNewName("");
        setNewAddress("");
        setIsAdding(false);
        setError(null);
        setLastGenerated(null);
    };

    const deleteWallet = (address: string) => {
        const updated = customWallets.filter(w => w.address !== address);
        setCustomWallets(updated);
        localStorage.setItem("excelsior_custom_wallets", JSON.stringify(updated));
    };

    const changeCategory = (address: string, newCategory: WalletInfo["type"]) => {
        const updated = { ...categoryOverrides, [address]: newCategory };
        setCategoryOverrides(updated);
        localStorage.setItem("excelsior_wallet_categories", JSON.stringify(updated));
    };

    const toggleFounder = (address: string) => {
        const next = new Set(founderWallets);
        if (next.has(address)) next.delete(address);
        else next.add(address);
        setFounderWallets(next);
        localStorage.setItem("excelsior_founder_wallets", JSON.stringify(Array.from(next)));
    };

    const onSync = async () => {
        setIsSyncing(true);
        setError(null);

        try {
            const connection = new Connection("https://api.devnet.solana.com", "confirmed");
            const allWalletsForTab = [...wallets, ...customWallets].filter(w => {
                const currentCat = categoryOverrides[w.address] || w.type;
                if (activeTab === "Founders") return founderAddresses.includes(w.address);
                if (founderAddresses.includes(w.address) && !categoryOverrides[w.address]) return false;
                return currentCat === activeTab;
            });

            if (allWalletsForTab.length === 0) {
                setIsSyncing(false);
                return;
            }

            const validWallets = allWalletsForTab.filter(w => {
                try {
                    new PublicKey(w.address);
                    return true;
                } catch { return false; }
            });

            const newBalances = { ...balances };
            for (const wallet of validWallets) {
                try {
                    const pubkey = new PublicKey(wallet.address);
                    const sol = await connection.getBalance(pubkey);

                    let lxr = 0;
                    try {
                        const ata = getAssociatedTokenAddressSync(LXR_MINT, pubkey, true, TOKEN_2022_PROGRAM_ID);
                        const bal = await connection.getTokenAccountBalance(ata);
                        lxr = bal.value.uiAmount || 0;
                    } catch (e) { }

                    let xls = 0;
                    try {
                        const ata = getAssociatedTokenAddressSync(XLS_MINT, pubkey, true, TOKEN_2022_PROGRAM_ID);
                        const bal = await connection.getTokenAccountBalance(ata);
                        xls = bal.value.uiAmount || 0;
                    } catch (e) { }

                    newBalances[wallet.address] = {
                        sol: sol / LAMPORTS_PER_SOL,
                        lxr,
                        xls
                    };
                } catch (e) {
                    console.warn(`Sync error for ${wallet.address}`);
                }
            }
            setBalances(newBalances);
        } catch (e: any) {
            setError(e.message || "Failed to sync with network");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        onSync();
    }, [activeTab]);

    const toggleVisibility = (address: string) => {
        const next = new Set(visibleAddresses);
        if (next.has(address)) next.delete(address);
        else next.add(address);
        setVisibleAddresses(next);
    };

    const startEditing = (address: string, currentName: string) => {
        setEditingId(address);
        setEditNameValue(customNames[address] || currentName);
    };

    const saveName = (address: string) => {
        const next = { ...customNames, [address]: editNameValue };
        setCustomNames(next);
        localStorage.setItem("excelsior_wallet_names", JSON.stringify(next));
        setEditingId(null);
    };

    const fmt = (n: number | undefined) => n ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.0000";

    const CategoryGuide = ({ type }: { type: WalletInfo["type"] }) => {
        const guides = {
            Founders: "Nivel de acceso supremo. Estas billeteras poseen el control total del suministro, la autoridad de génesis y privilegios de administración crítica sobre todo el ecosistema Excelsior.",
            Master: "Billeteras de control central y operaciones maestras del protocolo. Poseen privilegios administrativos y gestión de infraestructura.",
            Rewards: "Depósitos reservados para la distribución de incentivos, programas de staking y fidelización de la comunidad.",
            Assets: "Bóvedas de custodia para activos estratégicos y colaterales que respaldan el ecosistema Excelsior.",
            Fees: "Puntos de recaudación automática de comisiones y tasas impositivas por transferencias on-chain.",
            Holding: "Almacenamiento de activos en frío a largo plazo para asegurar la solvencia y estabilidad del tesoro.",
            Dead: "Carteras bloqueadas o inaccesibles. Estos activos se consideran fuera del suministro circulante debido a la pérdida de llaves o quema operativa."
        };
        return (
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] mb-12 animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-3xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">{type} Intelligence</h3>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed max-w-3xl">
                    {guides[type]}
                </p>
            </div>
        );
    };

    const WalletCard = ({ wallet }: { wallet: WalletInfo }) => {
        const balance = balances[wallet.address] || { sol: 0, lxr: 0, xls: 0 };
        const isEditing = editingId === wallet.address;
        const displayName = customNames[wallet.address] || wallet.name;
        const isFounder = founderWallets.has(wallet.address) || founderAddresses.includes(wallet.address);

        return (
            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group transition-all hover:bg-white/[0.04]">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h4 className="text-xl font-extralight text-white tracking-tighter">{displayName}</h4>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-1.5 h-1.5 rounded-full", isFounder ? "bg-blue-400 animate-pulse" : "bg-white/20")} />
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{wallet.type} Allocation</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(wallet.isFounder || isFounder) && (
                                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Shield size={14} className="text-blue-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5 space-y-2">
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Luxor Asset</span>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-lg font-extralight text-white tabular-nums tracking-tighter">{balance.lxr.toLocaleString()}</span>
                                    <span className="text-[9px] font-black text-blue-400">LXR</span>
                                </div>
                            </div>
                            <div className="bg-black/40 p-5 rounded-3xl border border-white/5 space-y-2">
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Excelsior Asset</span>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-lg font-extralight text-white tabular-nums tracking-tighter">{balance.xls.toLocaleString()}</span>
                                    <span className="text-[9px] font-black text-blue-400">XLS</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-6 py-4 bg-white/[0.01] rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em]">Gas Reserve</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-extralight text-white tabular-nums">{balance.sol.toFixed(4)}</span>
                                <span className="text-[9px] font-black text-emerald-400">SOL</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-white/10 uppercase tracking-widest mb-1">Terminal Address</span>
                            <span className="text-[10px] font-mono text-white/20 group-hover:text-blue-500/40 transition-colors">
                                {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                            </span>
                        </div>
                        <div className="flex gap-1.5">
                            <button onClick={() => { startEditing(wallet.address, wallet.name); }} className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-white/40 hover:text-white transition-all">
                                <Edit2 size={12} />
                            </button>
                            {customWallets.some(cw => cw.address === wallet.address) && (
                                <button onClick={() => deleteWallet(wallet.address)} className="p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500/40 hover:text-rose-500 transition-all">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <input
                                autoFocus
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="w-full bg-white/5 border border-blue-500/30 rounded-2xl px-6 py-4 text-sm font-light text-white text-center focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                placeholder="New Alias"
                            />
                            <div className="flex gap-2 w-full">
                                <button onClick={() => setEditingId(null)} className="flex-1 py-4 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Cancel</button>
                                <button onClick={() => saveName(wallet.address)} className="flex-2 py-4 px-8 rounded-xl bg-blue-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition-all">Save designation</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const SummaryBoard = () => {
        const dist = [
            { label: "Reserve", pct: "60%", lxr: "1.215B", xls: "12.15M", color: "bg-blue-500" },
            { label: "Holding", pct: "20%", lxr: "405M", xls: "4.05M", color: "bg-amber-400" },
            { label: "Ops", pct: "10%", lxr: "202.5M", xls: "2.025M", color: "bg-emerald-400" },
            { label: "Lock", pct: "9%", lxr: "182.25M", xls: "1.82M", color: "bg-rose-400" },
            { label: "Personal", pct: "1%", lxr: "20.25M", xls: "202.5k", color: "bg-cyan-400" },
        ];

        return (
            <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 mb-16 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="flex items-center gap-5 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Protocol Distribution Integrity</h3>
                        <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">Real-time supply verification</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                    {dist.map((item) => (
                        <div key={item.label} className="space-y-8 p-8 rounded-[3rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all group/stat relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover/stat:opacity-20 transition-opacity ${item.color}`} />
                            <div className="flex justify-between items-center relative z-10">
                                <span className="text-[10px] font-black text-white font-bold tracking-widest group-hover/stat:text-white/40 transition-colors">{item.label}</span>
                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black text-white shadow-xl shadow-current/10", item.color)}>{item.pct}</span>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] text-white font-black tracking-widest">LXR</span>
                                    <span className="text-2xl font-extralight text-white tabular-nums tracking-tighter">{item.lxr}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] text-white font-black tracking-widest">XLS</span>
                                    <span className="text-2xl font-extralight text-white tabular-nums tracking-tighter">{item.xls}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-wrap gap-16 items-center justify-center border-t border-white/5 pt-16">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white tracking-[0.2em] mb-3">Total Allocated Supply</span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-extralight text-white tabular-nums tracking-tighter">2,025,000,000</span>
                            <span className="text-[10px] font-black text-blue-400 tracking-widest">LXR</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-12 bg-white/5 hidden md:block" />
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white tracking-[0.2em] mb-3">Circulating Audit</span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-extralight text-white tabular-nums tracking-tighter">20,250,000</span>
                            <span className="text-[10px] font-black text-blue-400 tracking-widest">XLS</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-12 bg-white/5 hidden md:block" />
                    <div className="flex flex-col items-center group/dead">
                        <span className="text-[10px] font-black text-rose-500/40 tracking-[0.2em] mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                            Dead Supply (Excluded)
                        </span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-extralight text-rose-500 tabular-nums tracking-tighter">40,500,000</span>
                            <span className="text-[10px] font-black text-rose-500/40 tracking-widest">XLS</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const allWallets = [...wallets, ...customWallets];
    const currentWallets = allWallets.filter(w => {
        const currentCat = categoryOverrides[w.address] || w.type;
        if (activeTab === "Founders") return founderAddresses.includes(w.address);
        if (founderAddresses.includes(w.address) && !categoryOverrides[w.address]) return false;
        return currentCat === activeTab;
    });

    const getCategoryCount = (cat: typeof activeTab) => {
        return allWallets.filter(w => {
            const currentCat = categoryOverrides[w.address] || w.type;
            if (cat === "Founders") return founderAddresses.includes(w.address);
            if (founderAddresses.includes(w.address) && !categoryOverrides[w.address]) return false;
            return currentCat === cat;
        }).length;
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
            <SummaryBoard />

            <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] p-2.5 rounded-[2.5rem] w-fit mx-auto border border-white/5 backdrop-blur-3xl shadow-2xl relative z-20">
                {(["Founders", "Master", "Assets", "Rewards", "Fees", "Holding", "Dead"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-10 py-3.5 rounded-full text-[10px] font-black tracking-[0.2em] transition-all relative overflow-hidden group",
                            activeTab === tab
                                ? "bg-white text-black shadow-2xl shadow-blue-500/20 scale-105"
                                : "text-white hover:text-white/40 hover:bg-white/[0.02]"
                        )}
                    >
                        <span className="relative z-10">{tab}</span>
                        <span className={cn("ml-3 px-2 py-0.5 rounded-lg text-[9px] font-black transition-all", activeTab === tab ? "bg-black/10 text-black" : "bg-white/5 text-white/20")}>
                            {getCategoryCount(tab)}
                        </span>
                    </button>
                ))}
            </div>

            <CategoryGuide type={activeTab} />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12">
                {currentWallets.map(wallet => (
                    <WalletCard key={wallet.address} wallet={wallet} />
                ))}

                <button
                    onClick={() => setIsAdding(true)}
                    className="group min-h-[480px] w-full rounded-[3rem] border-2 border-dashed border-white/5 hover:border-blue-500/30 bg-white/[0.01] hover:bg-blue-500/5 transition-all duration-700 flex flex-col items-center justify-center gap-8"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-700">
                        <Plus className="w-10 h-10 text-white/10 group-hover:text-blue-400 transition-colors" strokeWidth={1} />
                    </div>
                    <div className="flex flex-col items-center gap-3 px-10 text-center">
                        <span className="text-sm font-light text-white/30 group-hover:text-white transition-colors uppercase tracking-widest">Register Fleet Unit</span>
                        <p className="text-[10px] text-white/10 leading-relaxed">
                            Create a new authorized terminal for the {activeTab} registry.
                        </p>
                    </div>
                </button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-700">
                    <div className="absolute inset-0 bg-black/90" onClick={() => setIsAdding(false)} />
                    <div className="relative w-full max-w-xl bg-[#0a0a0c] border border-white/5 rounded-[4rem] p-12 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-extralight text-white tracking-tighter">Authorize Terminal</h3>
                                <span className="text-[9px] font-black text-white tracking-[0.3em]">Protocol Fleet Registration</span>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                <Plus className="w-6 h-6 rotate-45 text-white/20 group-hover:text-white" />
                            </button>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/20 px-2">Unit Designation</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. ALPHA-9, OMEGA-1"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] px-8 py-5 text-sm font-light text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/5"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/20">Access Identifier</label>
                                    <button
                                        onClick={generateNewKeypair}
                                        className="text-[9px] font-black text-blue-400 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
                                    >
                                        <Zap size={10} />
                                        Auto-Generate
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Solana Public Key"
                                    value={newAddress}
                                    onChange={(e) => { setNewAddress(e.target.value); setLastGenerated(null); }}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] px-8 py-5 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                                />
                            </div>

                            {lastGenerated && (
                                <div className="p-8 bg-blue-500/[0.03] border border-blue-500/10 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <Shield size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Master Secret Protocol</span>
                                    </div>
                                    <p className="text-[10px] text-white/30 leading-relaxed">
                                        This keypair is generated locally. Save the private key immediately; it will be destroyed upon session closure.
                                    </p>
                                    <div className="relative group">
                                        <textarea
                                            readOnly
                                            value={lastGenerated.secret}
                                            className="w-full bg-black/60 border border-white/5 rounded-2xl p-5 text-[9px] font-mono text-white/40 resize-none h-24 outline-none"
                                        />
                                        <button
                                            onClick={() => navigator.clipboard.writeText(lastGenerated.secret)}
                                            className="absolute bottom-4 right-4 px-5 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Secure Key
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 flex flex-col gap-6">
                                {error && (
                                    <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black tracking-widest animate-pulse px-2">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={addWallet}
                                    className="w-full py-6 bg-white text-black rounded-[2rem] text-[11px] font-black tracking-[0.3em] shadow-2xl hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Confirm authorization
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
