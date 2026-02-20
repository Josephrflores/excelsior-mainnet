
import React from "react";
import { History } from "lucide-react";
import { motion } from "framer-motion";

export const DisplacementLogs = () => {
    return (
        <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full text-center py-20"
        >
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                <History className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight">Displacement Logs</h2>
            <p className="text-white/40 mt-2 text-sm">On-chain transaction history integration pending.</p>
        </motion.div>
    );
};
