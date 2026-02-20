
import React from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./index";

interface ModuleGuardProps {
    moduleId: "lxr" | "xls" | "usdx";
    moduleFlags: number;
    children: React.ReactNode;
}

const MODULE_BITS = {
    lxr: 1,  // Bit 0: 001
    xls: 2,  // Bit 1: 010
    usdx: 4  // Bit 2: 100
};

export const ModuleGuard = ({ moduleId, moduleFlags, children }: ModuleGuardProps) => {
    const bit = MODULE_BITS[moduleId];
    const isLocked = (moduleFlags & bit) === 0;

    if (!isLocked) return <>{children}</>;

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {/* Blurry Content Container */}
            <div className="absolute inset-0 filter blur-xl opacity-30 select-none pointer-events-none grayscale">
                {children}
            </div>

            {/* Premium Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 z-50">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-white/[0.03] border border-white/10 rounded-full mb-8 relative"
                >
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                    <Lock className="w-12 h-12 text-white relative z-10" />
                </motion.div>

                <h2 className="text-3xl font-light text-white tracking-tight mb-4">Módulo Bloqueado</h2>
                <p className="text-white/40 text-center max-w-md px-8 mb-10 font-light leading-relaxed">
                    Este sistema está restringido por Gobernanza. El acceso se habilitará en la
                    <span className="text-white"> Fase de Lanzamiento {moduleId.toUpperCase()}</span>.
                </p>

                <div className="flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-[10px] font-bold text-red-400 tracking-[0.2em] uppercase">Security Protocol Active</span>
                </div>
            </div>
        </div>
    );
};
