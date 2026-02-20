
import React from "react";
import { Server, Smartphone } from "lucide-react";

export const DeviceList = () => {
    return (
        <div className="tech-card p-8 border-[#1a73e8]/10 bg-[#1a73e8]/[0.02]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium text-white flex items-center gap-3">
                    <Server className="w-5 h-5 text-[#1a73e8]" />
                    Authorized fleet
                </h3>
                <span className="px-3 py-1 bg-[#1a73e8]/10 text-[#1a73e8] text-[10px] rounded-full font-medium">12 Active nodes</span>
            </div>

            <div className="space-y-4">
                {[
                    { name: "Seeker POS #081", id: "SK-9921", status: "Online", signal: 4 },
                    { name: "Seeker POS #082", id: "SK-9922", status: "Online", signal: 3 },
                    { name: "PSG-1 Node Alpha", id: "PS-001X", status: "Maintenance", signal: 0 }
                ].map((device, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.status === 'Online' ? 'bg-[#1a73e8]/10' : 'bg-red-500/10'}`}>
                                <Smartphone className={`w-5 h-5 ${device.status === 'Online' ? 'text-[#1a73e8]' : 'text-red-500'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">{device.name}</p>
                                <p className="text-[10px] text-white/20 font-medium">ID: {device.id}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`w-1 h-3 rounded-full ${s <= device.signal ? 'bg-[#1a73e8]' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <span className={`text-[9px] font-medium ${device.status === 'Online' ? 'text-[#1a73e8]' : 'text-white/20'}`}>{device.status}</span>
                        </div>
                    </div>
                ))}

                <button className="btn-blue-outline w-full py-4 text-[11px] mt-4 flex items-center justify-center gap-2">
                    Register new device
                </button>
            </div>
        </div>
    );
};
