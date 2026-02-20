"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { EnvConfig, ENVIRONMENTS, EnvType, DEFAULT_ENV } from "@/lib/environments";

interface EnvContextType {
    env: EnvType;
    config: EnvConfig;
    setEnv: (env: EnvType) => void;
    isSimulation: boolean;
    setSimulation: (bs: boolean) => void;
}

const EnvContext = createContext<EnvContextType | undefined>(undefined);

export function EnvProvider({ children }: { children: ReactNode }) {
    const [env, setEnvState] = useState<EnvType>(DEFAULT_ENV);
    const [isSimulation, setSimulation] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("excelsior_env") as EnvType;
        if (stored && ENVIRONMENTS[stored]) {
            setEnvState(stored);
        }
    }, []);

    const setEnv = (newEnv: EnvType) => {
        setEnvState(newEnv);
        localStorage.setItem("excelsior_env", newEnv);
        // Switching network turns off simulation by default (user wants to see network data)
        setSimulation(false);
        // window.location.reload(); // Removed force reload to allow smooth toggle
    };

    return (
        <EnvContext.Provider value={{ env, config: ENVIRONMENTS[env], setEnv, isSimulation, setSimulation }}>
            {children}
        </EnvContext.Provider>
    );
}

export function useEnv() {
    const context = useContext(EnvContext);
    if (context === undefined) {
        throw new Error("useEnv must be used within an EnvProvider");
    }
    return context;
}
