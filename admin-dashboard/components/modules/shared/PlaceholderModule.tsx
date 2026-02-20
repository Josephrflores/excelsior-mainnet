import React from "react";
import { Activity } from "lucide-react";
import { ModuleHeader } from "./ModuleHeader";
import { ManualSection } from "./ManualSection";
import { cn } from "./cn";

export const PlaceholderModule = ({ title, description, icon, manual }: any) => (
    <div className="space-y-24 animate-in fade-in duration-700">
        <ModuleHeader title={title} subtitle={description} icon={icon} />

        <div className="tech-card p-24 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                <Activity className="w-10 h-10 text-white/20" />
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-medium text-white tracking-tight">
                    Module under development
                </h3>
                <p className="text-[11px] text-white/20 font-medium tracking-widest max-w-sm leading-relaxed">
                    The interface for engine {title.toLowerCase()} is currently being synchronized with the core protocol.
                </p>
            </div>
        </div>

        {manual && (
            <ManualSection
                title={title}
                steps={manual}
            />
        )}
    </div>
);
