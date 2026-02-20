
"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { ModuleHeader } from "../shared/index";
import { SwapCard } from "./SwapCard";

export const SwapModule = () => {
    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <ModuleHeader
                title="Exchange & Convert"
                subtitle="Intercambio instantáneo de activos del ecosistema Luxor"
                icon={RefreshCw}
            />

            <SwapCard />
        </div>
    );
};

export default SwapModule;
