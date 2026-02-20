
import React from "react";
import { ClipboardCheck, Eye } from "lucide-react";
import { motion } from "framer-motion";

export const AuditLogs = () => {
    return (
        <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-8"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-white tracking-tight">Audit Logs</h1>
                <button className="px-4 py-2 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all flex items-center gap-2">
                    <ClipboardCheck size={14} />
                    Export CSV
                </button>
            </div>

            <div className="space-y-2">
                {[
                    { action: "Updated Inflation Rate", user: "Admin (Hardware Wallet)", time: "2 mins ago", status: "success" },
                    { action: "Force Burn Executed", user: "Squads Multisig", time: "2 hours ago", status: "success" },
                    { action: "Failed Login Attempt", user: "Unknown IP", time: "5 hours ago", status: "failed" },
                    { action: "Fee Config Change", user: "Admin (Hot Wallet)", time: "1 day ago", status: "success" },
                ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <div>
                                <p className="text-sm font-medium text-white">{log.action}</p>
                                <p className="text-[10px] text-white/40 font-mono mt-0.5">{log.user}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] text-white/20">{log.time}</span>
                            <div className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye size={14} className="text-white/60" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
