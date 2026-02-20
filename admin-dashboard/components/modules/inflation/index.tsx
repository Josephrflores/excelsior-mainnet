import { Zap } from "lucide-react";
import { ModuleHeader, ManualSection } from "../shared/index";
import { InflationTrigger } from "./InflationTrigger";

export const InflationModule = () => {
    return (
        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <ModuleHeader title="Monetary Policy" subtitle="Algorithmic emission control" icon={Zap} />

            <InflationTrigger />

            <ManualSection
                title="Control monetario"
                steps={[
                    "Inflación asegurada mediante bloqueo temporal on-chain",
                    "Se requiere autoridad de administrador para firmar",
                    "Tokens asignados a la reserva maestra",
                    "Rechazo automático en intentos prematuros"
                ]}
            />
        </div>
    );
};
