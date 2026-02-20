import {
    Activity,
    ShieldAlert,
    TrendingUp,
    Database,
    Coins,
    Cpu,
    Zap,
    Factory,
    BarChart3,
    RefreshCw,
    Send,
    ShieldCheck,
    PieChart,
    Layers,
    Globe
} from 'lucide-react';

// Corregir importación de Shield/Shields
const Shields = ShieldCheck; // Assuming ShieldCheck is intended, as Shield is not imported

export const SUITE_NODES = [
    { href: "/modules/advanced-economy", icon: TrendingUp, title: "Economy", subtitle: "Advanced Control", color: "blue", moduleId: "usdx" },
    { href: "/modules/security-god-mode", icon: ShieldAlert, title: "God Mode", subtitle: "Security & Burn", color: "rose" },
    { href: "/modules/supply", icon: Activity, title: "Supply", subtitle: "Circulation", color: "emerald" },
    { href: "/modules/staking", icon: Database, title: "Staking", subtitle: "Rewards & Pools", color: "purple", moduleId: "xls" },
    { href: "/modules/liquidity-reserves", icon: Coins, title: "Liquidity", subtitle: "Treasury Reserves", color: "amber" },
    { href: "/modules/hardware-integration", icon: Cpu, title: "Hardware", subtitle: "Fleet & Firmware", color: "slate" },
    { href: "/modules/inflation", icon: Zap, title: "Inflation", subtitle: "Policy Trigger", color: "yellow" },
    { href: "/modules/contract-factory", icon: Factory, title: "Factory", subtitle: "Deploy & Templates", color: "indigo" },
    { href: "/modules/analytics", icon: BarChart3, title: "Analytics", subtitle: "On-chain Metrics", color: "cyan" },
    { href: "/modules/swap-convert", icon: RefreshCw, title: "Swap", subtitle: "Convert & Exchange", color: "emerald" },
    { href: "/modules/fleet-transfer", icon: Send, title: "Transfers", subtitle: "Fleet Engine", color: "blue" },
    { href: "/modules/governance", icon: ShieldCheck, title: "Governance", subtitle: "Protocol Pause", color: "slate", moduleId: "xls" },
    { href: "/modules/ecosystem", icon: Globe, title: "Ecosystem", subtitle: "Live Prices & Hub", color: "blue" },
    { href: "/modules/supply", icon: PieChart, title: "Treasury", subtitle: "Management", color: "blue" },
];
