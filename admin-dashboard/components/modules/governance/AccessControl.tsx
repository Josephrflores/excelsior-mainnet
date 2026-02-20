
import React, { useState } from "react";
import { ShieldAlert, Power, Users, UserPlus, UserMinus } from "lucide-react";
import { motion } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { useProtocol, cn } from "../shared/index";

interface AccessControlProps {
    accessControl: any;
    fetchGovernanceState: () => void;
}

export const AccessControl = ({ accessControl, fetchGovernanceState }: AccessControlProps) => {
    const { status, setStatus, setMessage, getProgram, wallet } = useProtocol();
    const [newOperator, setNewOperator] = useState("");

    const handleTogglePause = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey) return;

        setStatus("loading");
        try {
            const [acPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("access_control")],
                program.programId
            );

            const tx = await (program.methods as any)
                .emergencyPause(!accessControl?.paused)
                .accounts({
                    accessControl: acPda,
                    signer: wallet.publicKey,
                } as any)
                .rpc();

            setStatus("success");
            setMessage(`Protocol ${!accessControl?.paused ? 'PAUSED' : 'UNPAUSED'}`);
            fetchGovernanceState();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Failed to toggle pause");
        }
    };

    const handleGrantOperator = async () => {
        const program = getProgram();
        if (!program || !wallet.publicKey || !newOperator) return;

        setStatus("loading");
        try {
            const [acPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("access_control")],
                program.programId
            );

            const tx = await (program.methods as any)
                .grantOperator(new PublicKey(newOperator))
                .accounts({
                    accessControl: acPda,
                    authority: wallet.publicKey,
                } as any)
                .rpc();

            setStatus("success");
            setMessage("Operator granted successfully");
            setNewOperator("");
            fetchGovernanceState();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Failed to grant operator");
        }
    };

    const handleRevokeOperator = async (opKey: PublicKey) => {
        const program = getProgram();
        if (!program || !wallet.publicKey) return;

        setStatus("loading");
        try {
            const [acPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("access_control")],
                program.programId
            );

            const tx = await (program.methods as any)
                .revoke_operator(opKey)
                .accounts({
                    accessControl: acPda,
                    authority: wallet.publicKey,
                } as any)
                .rpc();

            setStatus("success");
            setMessage("Operator revoked");
            fetchGovernanceState();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Failed to revoke operator");
        }
    };

    return (
        <motion.div
            key="controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 w-full"
        >
            <h1 className="text-4xl font-light text-white tracking-tight">Access Control</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Emergency Control */}
                <div className="p-10 border border-red-500/10 bg-red-500/[0.02] rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-red-500/10 transition-all duration-1000" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white tracking-tight">Master Kill-Switch</h3>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                            Instantly halts all protocol execution (Swaps, Stake, Withdrawals).
                            Only use in verified critical vulnerability scenarios.
                        </p>

                        <button
                            onClick={handleTogglePause}
                            disabled={status === 'loading'}
                            className={cn(
                                "w-full py-6 rounded-2xl flex items-center justify-center gap-4 font-black tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl active:scale-95 uppercase",
                                accessControl?.paused
                                    ? "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-[#1a73e8]/30"
                                    : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30"
                            )}
                        >
                            <Power size={18} />
                            {accessControl?.paused ? "Resume Protocol" : "Stop Protocol Execution"}
                        </button>
                    </div>
                </div>

                {/* Operator Management */}
                <div className="p-10 border border-[#1a73e8]/10 bg-[#1a73e8]/[0.02] rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#1a73e8]/5 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-[#1a73e8]/10 transition-all duration-1000" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center border border-[#1a73e8]/20">
                            <Users className="w-6 h-6 text-[#1a73e8]" />
                        </div>
                        <h3 className="text-xl font-medium text-white tracking-tight">Guardian Management</h3>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Operator Address (Public Key)"
                                value={newOperator}
                                onChange={(e) => setNewOperator(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] font-medium text-white outline-none focus:border-[#1a73e8]/30 transition-all placeholder:text-white/10"
                            />
                            <button
                                onClick={handleGrantOperator}
                                className="w-14 h-14 bg-[#1a73e8] rounded-2xl flex items-center justify-center text-white hover:bg-[#1557b0] transition-all"
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {accessControl?.operators.map((op: PublicKey, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 group/item hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[#1a73e8]/10 flex items-center justify-center text-[10px] font-bold text-[#1a73e8]">
                                            {idx + 1}
                                        </div>
                                        <span className="text-[11px] font-mono text-white/40 group-hover/item:text-white/60 transition-colors">
                                            {op.toString().slice(0, 12)}...{op.toString().slice(-12)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeOperator(op)}
                                        className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        <UserMinus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
