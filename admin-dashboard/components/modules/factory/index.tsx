import { Rocket, ShieldCheck } from "lucide-react";
import { ModuleHeader, ManualSection } from "../shared/index";
import { ContractForm } from "./ContractForm";
import { ContractSpecs } from "./ContractSpecs";
import { ContractManager } from "./ContractManager";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const ContractFactoryModule = () => {
    const [activeTab, setActiveTab] = useState<"builder" | "manager">("builder");

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <ModuleHeader
                    title="Contract factory"
                    subtitle="Virtual asset tokenization"
                    icon={Rocket}
                />

                {/* Tab Switcher */}
                <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab("builder")}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                            activeTab === "builder" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        <Rocket size={12} />
                        Builder
                    </button>
                    <button
                        onClick={() => setActiveTab("manager")}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                            activeTab === "manager" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                    >
                        <ShieldCheck size={12} />
                        Manager
                    </button>
                </div>
            </div>

            {activeTab === "builder" ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <ContractForm />
                        <ContractSpecs />
                    </div>

                    <ManualSection
                        title="Contract deployment"
                        steps={[
                            "Strict adherence to Solana SPL token extensions (2022)",
                            "On-chain identifiers are immutable post-initialization",
                            "Metadata assets should be pre-paired in the next tab",
                            "Deploying authority retains primary minting privileges"
                        ]}
                    />
                </>
            ) : (
                <ContractManager />
            )}
        </div>
    );
};

