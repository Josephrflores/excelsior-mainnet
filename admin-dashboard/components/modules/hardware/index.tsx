
"use client";

import { Cpu } from "lucide-react";
import { InstructionModule } from "@/components/ui/instruction-module";

// Import extracted components
import { ModuleHeader } from "../shared/index";
import { DeviceList } from "./DeviceList";
import { HardwareControls } from "./HardwareControls";
import { NetworkStats } from "./NetworkStats";

export default function HardwareModule() {
    const guideSteps = [
        {
            title: "Device Registry",
            content: "Registra y autoriza nuevas terminales Seeker o PSG1. Cada dispositivo recibe una firma criptográfica única vinculada a la autoridad de acuñación."
        },
        {
            title: "Remote Kill-Switch",
            content: "En caso de robo o compromiso, desactiva instantáneamente cualquier dispositivo físico desde el dashboard. Revoca todos los permisos on-chain."
        },
        {
            title: "Firmware Sync",
            content: "Actualiza las reglas de validación y seguridad en todos los dispositivos conectados de forma masiva y segura."
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-medium text-white tracking-tight flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-[#1a73e8]" />
                        Hardware Integration
                    </h2>
                    <p className="text-white/40 text-sm mt-1 font-medium">Physical Terminal & Infrastructure Sync</p>
                </div>
                <InstructionModule
                    title="Hardware Management Guide"
                    description="Enterprise tools for physical device fleet control."
                    steps={guideSteps}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Device Fleet */}
                <DeviceList />

                {/* Kill-Switch & Firmware */}
                <HardwareControls />

                {/* Network Statistics */}
                <NetworkStats />
            </div>
        </div>
    );
}
