
"use client";

import { Coins } from "lucide-react";
import { InstructionModule } from "@/components/ui/instruction-module";

// Import extracted components
import { TreasuryBreakdown } from "./TreasuryBreakdown";
import { ModuleHeader } from "../shared/index";
import { PegOptimizer } from "./PegOptimizer";
import { StakingTiers } from "./StakingTiers";

export default function LiquidityAdvancedModule() {
    const guideSteps = [
        {
            title: "Treasury Management",
            content: "Visualiza en tiempo real los activos que respaldan el protocolo. Incluye SOL, USDC y activos del mundo real (RWA) tokenizados."
        },
        {
            title: "Auto-Arbitrage Bot",
            content: "Sistema algorítmico que compra Luxor cuando el precio baja y Excelsior cuando sube, manteniendo la paridad 1:1 de forma autónoma."
        },
        {
            title: "Staking Tiers",
            content: "Configura los multiplicadores de recompensa según el rango del usuario. Niveles: Silver, Gold, Platinum y Diamond."
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-medium text-white tracking-tight flex items-center gap-3">
                        <Coins className="w-8 h-8 text-[#1a73e8]" />
                        Liquidity & Reserves
                    </h2>
                    <p className="text-white/40 text-sm mt-1 font-medium">Excelsior Peg & Treasury Intelligence</p>
                </div>
                <InstructionModule
                    title="Liquidity Control Guide"
                    description="Advanced tools for reserve management and peg stability."
                    steps={guideSteps}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Treasury Breakdown */}
                <TreasuryBreakdown />

                {/* Arbitrage Control */}
                <PegOptimizer />

                {/* Staking Tiers */}
                <StakingTiers />
            </div>
        </div>
    );
}
