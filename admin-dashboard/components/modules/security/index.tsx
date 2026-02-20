
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck,
    Activity,
    Users,
    ClipboardCheck,
    Siren,
    Zap,
    ChevronLeft,
    CheckCircle,
    AlertCircle,
    RotateCw,
    PieChart
} from "lucide-react";
import Link from 'next/link';
import { PublicKey } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { toast } from "sonner";
import { useProtocol, cn } from "../shared/index";
import idl from "@/lib/idl/excelsior.json";
import { motion, AnimatePresence } from "framer-motion";

// Import extracted components
import { ThreatDashboard } from "./ThreatDashboard";
import { FeeManager } from "./FeeManager";
import { RiskControls } from "./RiskControls";
import { Emergency } from "./Emergency";
import { Multisig } from "./Multisig";
import { AuditLogs } from "./AuditLogs";

export default function SecurityModule() {
    const { status, setStatus, message, setMessage, getProgram, wallet, connection, config: envConfig } = useProtocol();
    const [feeActive, setFeeActive] = useState(false);
    const [accountConfig, setAccountConfig] = useState<any>(null);
    const [accessControl, setAccessControl] = useState<any>(null);
    const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"dashboard" | "fees" | "risk" | "emergency" | "multisig" | "audit">("dashboard");

    // Fee State
    const [baseFee, setBaseFee] = useState("0.5");
    const [botTax, setBotTax] = useState("15.0");

    // Withdrawal Form State
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawBeneficiary, setWithdrawBeneficiary] = useState("");

    const fetchSecurityState = useCallback(async () => {
        if (!wallet.publicKey) return;
        try {
            const program = getProgram();
            if (!program) return;

            // Fetch Global Config
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const globalConfig: any = await (program.account as any).GlobalConfig.fetch(configPda);
            setAccountConfig(globalConfig);
            setFeeActive(globalConfig.feeBasisPoints > 0);

            // Fetch Access Control
            const [acPda] = PublicKey.findProgramAddressSync([Buffer.from("access_control")], program.programId);
            try {
                const ac: any = await (program.account as any).AccessControl.fetch(acPda);
                setAccessControl(ac);
            } catch (e) { console.log("AccessControl not initialized"); }

            // Fetch Pending Withdrawals
            const requests = await (program.account as any).WithdrawalRequest.all();
            setWithdrawalRequests(requests.map((r: any) => ({ ...r.account, publickey: r.publicKey })));

        } catch (error) {
            console.error("Error fetching security state:", error);
        }
    }, [getProgram, wallet.publicKey]);

    useEffect(() => {
        fetchSecurityState();
    }, [fetchSecurityState]);

    const handleRequestWithdrawal = async () => {
        if (!wallet.publicKey || !withdrawAmount) return;
        setStatus("loading");
        setMessage("Requesting Withdrawal...");
        try {
            const program = getProgram();
            if (!program) return;
            const amount = new BN(parseFloat(withdrawAmount) * 1e9);
            const beneficiary = withdrawBeneficiary ? new PublicKey(withdrawBeneficiary) : wallet.publicKey;

            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const [withdrawalRequestPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("withdrawal_request"), wallet.publicKey.toBuffer(), Buffer.from(Date.now().toString())],
                program.programId
            );

            const tx = await (program.methods as any).requestWithdrawal(amount, beneficiary)
                .accounts({
                    signer: wallet.publicKey,
                    globalConfig: configPda,
                    withdrawalRequest: withdrawalRequestPda,
                }).rpc();

            setStatus("success");
            setMessage("Withdrawal Requested (24h Lock)");
            toast.success("Request Sent", { description: `Tx: ${tx.slice(0, 8)}...` });
            setWithdrawAmount("");
            fetchSecurityState();
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message);
            toast.error("Request Failed", { description: err.message });
        }
    };

    const handleExecuteWithdrawal = async (requestPda: PublicKey) => {
        if (!wallet.publicKey) return;
        setStatus("loading");
        setMessage("Executing Withdrawal...");
        try {
            const program = getProgram();
            if (!program) return;
            const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], program.programId);
            const configData: any = await (program.account as any).GlobalConfig.fetch(configPda);

            const tx = await (program.methods as any).executeWithdrawal()
                .accounts({
                    signer: wallet.publicKey,
                    globalConfig: configPda,
                    withdrawalRequest: requestPda,
                    vault: configData.rwaVaultLxr,
                    tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
                }).rpc();

            setStatus("success");
            setMessage("Withdrawal Executed");
            toast.success("Withdrawal Complete", { description: `Tx: ${tx.slice(0, 8)}...` });
            fetchSecurityState();
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message);
            toast.error("Execution Failed", { description: err.message });
        }
    };

    const handleSetPause = async (pause: boolean) => {
        if (!wallet.publicKey) return;
        setStatus("loading");
        setMessage(pause ? "Pausing Protocol..." : "Unpausing Protocol...");
        try {
            const program = getProgram();
            if (!program) return;
            const [acPda] = PublicKey.findProgramAddressSync([Buffer.from("access_control")], program.programId);

            const tx = await (program.methods as any).setPause(pause)
                .accounts({
                    accessControl: acPda,
                    signer: wallet.publicKey,
                }).rpc();

            setStatus("success");
            setMessage(`Protocol ${pause ? 'Paused' : 'Unpaused'}`);
            toast.success(`Success`, { description: `Protocol is now ${pause ? 'PAUSED' : 'ACTIVE'}` });
            fetchSecurityState();
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message);
            toast.error("Pause Logic Failed", { description: err.message });
        }
    };

    const SidebarItem = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative",
                activeTab === id ? "text-white" : "text-white/40 hover:text-white"
            )}
        >
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 bg-white transition-opacity duration-300",
                activeTab === id ? "opacity-100" : "opacity-0"
            )} />
            <Icon className={cn("w-5 h-5 shrink-0 transition-colors", activeTab === id ? "text-white" : "text-white/40 group-hover:text-white")} />
            <span className="text-sm font-medium tracking-tight text-left">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full min-h-[80vh] w-full animate-in fade-in duration-700">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-white/5 flex flex-col justify-between shrink-0 bg-[#050507]">
                <div>
                    <div className="px-8 pt-12 pb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white tracking-[0.2em]">SECURITY ADMIN</span>
                        </div>
                        <h2 className="text-2xl font-light text-white tracking-tight">Security</h2>
                        <p className="text-white/40 text-xs mt-2 font-light">Risk & Access Control</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarItem id="dashboard" label="Threat Dashboard" icon={ShieldCheck} />
                        <div className="h-4" />
                        <SidebarItem id="fees" label="Fee Manager" icon={Zap} />
                        <SidebarItem id="risk" label="Risk Controls" icon={Activity} />
                        <SidebarItem id="emergency" label="Emergency" icon={Siren} />
                        <SidebarItem id="multisig" label="Squads Multisig" icon={Users} />
                        <SidebarItem id="audit" label="Audit Logs" icon={ClipboardCheck} />
                    </div>
                </div>

                <div className="p-8">
                    <Link
                        href="/"
                        className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group"
                    >
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium tracking-wide">Return to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <ThreatDashboard
                            key="dashboard"
                            feeActive={feeActive}
                            withdrawalRequests={withdrawalRequests}
                            config={accountConfig}
                        />
                    )}

                    {activeTab === 'fees' && (
                        <FeeManager
                            key="fees"
                            feeActive={feeActive}
                            setFeeActive={setFeeActive}
                        />
                    )}

                    {activeTab === 'risk' && (
                        <RiskControls
                            key="risk"
                            config={accountConfig}
                            withdrawAmount={withdrawAmount}
                            setWithdrawAmount={setWithdrawAmount}
                            withdrawBeneficiary={withdrawBeneficiary}
                            setWithdrawBeneficiary={setWithdrawBeneficiary}
                            withdrawalRequests={withdrawalRequests}
                            handleRequestWithdrawal={handleRequestWithdrawal}
                            handleExecuteWithdrawal={handleExecuteWithdrawal}
                            status={status}
                        />
                    )}

                    {activeTab === 'emergency' && (
                        <Emergency
                            key="emergency"
                            status={status}
                            fetchSecurityState={fetchSecurityState}
                            handleSetPause={handleSetPause}
                            accessControl={accessControl}
                        />
                    )}

                    {activeTab === 'multisig' && (
                        <Multisig key="multisig" />
                    )}

                    {activeTab === 'audit' && (
                        <AuditLogs key="audit" />
                    )}
                </AnimatePresence>

                {/* Notification Bar */}
                <AnimatePresence>
                    {
                        status !== 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, x: 50 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, y: 50, x: 50 }}
                                className={cn(
                                    "fixed bottom-12 right-12 p-6 rounded-2xl border shadow-2xl backdrop-blur-3xl",
                                    status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#1a73e8]/10 border-[#1a73e8]/20 text-[#1a73e8]'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", status === 'error' ? 'bg-red-500/20' : 'bg-[#1a73e8]/20')}>
                                        {status === 'loading' ? <RotateCw className="w-5 h-5 animate-spin" /> : status === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-60">Security Alert</p>
                                        <p className="text-sm font-medium">{message}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
            </div>
        </div>
    );
}
