
import React, { useState, useEffect } from "react";
import { useProtocol, cn, PROGRAM_ID } from "../shared/index";
import { PublicKey } from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { Lock, Unlock, Clock, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const VestingManagement = () => {
    const { connection, wallet, status, setStatus, message, setMessage, getProgram } = useProtocol();
    const [activeView, setActiveView] = useState<"create" | "my-locks">("create");

    // Form State
    const [beneficiary, setBeneficiary] = useState("");
    const [amount, setAmount] = useState("");
    const [cliffMonths, setCliffMonths] = useState(6);
    const [durationMonths, setDurationMonths] = useState(24);

    // My Vesting
    const [schedules, setSchedules] = useState<any[]>([]);

    const fetchSchedules = async () => {
        if (!wallet.publicKey) return;
        const program = getProgram();
        if (!program) return;
        try {
            const result = await connection.getProgramAccounts(PROGRAM_ID, {
                filters: [
                    { dataSize: 169 },
                    { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } }
                ]
            });

            const parsed = await Promise.all(result.map(async (acc) => {
                try {
                    const data = await (program.account as any).VestingSchedule.fetch(acc.pubkey);
                    return { pubkey: acc.pubkey, ...data };
                } catch (e) { return null; }
            }));

            setSchedules(parsed.filter(s => s));
        } catch (e) { console.error("Fetch vesting error", e); }
    };

    useEffect(() => {
        fetchSchedules();
    }, [wallet.publicKey]);

    const handleCreateLock = async () => {
        if (!wallet.publicKey || !beneficiary || !amount) return;
        setStatus("loading");
        setMessage("Initializing token lock...");
        try {
            const program = getProgram();
            if (!program) throw new Error("Wallet not connected");

            const amt = new BN(parseFloat(amount) * 1e9);
            const now = Math.floor(Date.now() / 1000);
            const start = new BN(now);
            const cliff = new BN(now + (cliffMonths * 30 * 24 * 60 * 60));
            const end = new BN(now + (durationMonths * 30 * 24 * 60 * 60));

            const benPubkey = new PublicKey(beneficiary);
            const [globalPda] = PublicKey.findProgramAddressSync([Buffer.from("global_config")], PROGRAM_ID);
            const config: any = await (program.account as any).GlobalConfig.fetch(globalPda);
            const mint = config.lxrMint;

            const [schedulePda] = PublicKey.findProgramAddressSync([Buffer.from("vesting"), benPubkey.toBuffer(), mint.toBuffer()], PROGRAM_ID);
            const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vesting_vault"), schedulePda.toBuffer()], PROGRAM_ID);

            const adminAta = await web3.PublicKey.findProgramAddressSync(
                [wallet.publicKey.toBuffer(), new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb").toBuffer(), mint.toBuffer()],
                new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
            )[0];

            const tx = await (program as any).methods
                .createVesting(amt, start, cliff, end)
                .accounts({
                    admin: wallet.publicKey,
                    vestingSchedule: schedulePda,
                    beneficiary: benPubkey,
                    mint: mint,
                    vestingVault: vaultPda,
                    adminTokenAccount: adminAta,
                    tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
                    systemProgram: web3.SystemProgram.programId,
                } as any).rpc();

            setStatus("success");
            setMessage(`Lock created for ${beneficiary}`);
            toast.success("Vesting Vault Created", { description: `Tx: ${tx.slice(0, 8)}...` });
            setBeneficiary(""); setAmount("");
            fetchSchedules();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Encryption error in vault");
            toast.error("Creation Failed", { description: e.message });
        }
    };

    const handleClaim = async (schedule: any) => {
        if (!wallet.publicKey) return;
        setStatus("loading");
        setMessage("Claiming vested tokens...");
        try {
            const program = getProgram();
            if (!program) throw new Error("Wallet not connected");

            const userAta = await web3.PublicKey.findProgramAddressSync(
                [wallet.publicKey.toBuffer(), new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb").toBuffer(), schedule.mint.toBuffer()],
                new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
            )[0];

            const tx = await (program.methods as any)
                .claimVested()
                .accounts({
                    beneficiary: wallet.publicKey,
                    vestingSchedule: schedule.pubkey,
                    mint: schedule.mint,
                    vault: schedule.vault,
                    beneficiaryTokenAccount: userAta,
                    tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
                } as any).rpc();

            setStatus("success");
            setMessage("Tokens successfully released");
            toast.success("Claim Successful", { description: "Tokens added to your wallet." });
            fetchSchedules();
        } catch (e: any) {
            setStatus("error");
            setMessage(e.message || "Claim denied by protocol");
            toast.error("Claim Failed", { description: e.message });
        }
    };

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h3 className="text-3xl font-light text-white tracking-tight">Vesting Management</h3>
                    <p className="text-white/40 text-xs font-mono mt-2 uppercase tracking-widest">Protocol Incentive Layer</p>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                    <button
                        onClick={() => setActiveView("create")}
                        className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all", activeView === 'create' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                    >
                        Create Lock
                    </button>
                    <button
                        onClick={() => setActiveView("my-locks")}
                        className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all", activeView === 'my-locks' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                    >
                        My Schedules
                    </button>
                </div>
            </div>

            {activeView === 'create' ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3 tech-card p-12 space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                            <h4 className="text-xl font-medium text-white">Vault Configuration</h4>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Beneficiary Address</label>
                                    <input value={beneficiary} onChange={e => setBeneficiary(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-violet-500/50 transition-all font-mono" placeholder="Solana Wallet..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Amount (LXR)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-violet-500/50 transition-all font-mono" placeholder="100,000" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Cliff Period (Months)</label>
                                    <input type="number" value={cliffMonths} onChange={e => setCliffMonths(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-violet-500/50 transition-all font-mono" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Total Duration (Months)</label>
                                    <input type="number" value={durationMonths} onChange={e => setDurationMonths(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-violet-500/50 transition-all font-mono" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleCreateLock} disabled={status === 'loading'} className="w-full py-5 bg-violet-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-violet-500 transition-all flex items-center justify-center gap-3">
                            {status === 'loading' ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Initialize token lock
                        </button>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="tech-card p-10 border-violet-500/10 bg-violet-500/5">
                            <h5 className="text-violet-400 text-[10px] font-black tracking-widest uppercase mb-4">Vesting Policy</h5>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Schedules are permanently recorded on the Solana blockchain. Once initialized, the tokens are transferred to an escrow vault and can only be claimed by the beneficiary according to the specified linear release schedule.
                            </p>
                        </div>
                        <div className="tech-card p-10 border-white/5 bg-white/[0.02]">
                            <h5 className="text-white/20 text-[10px] font-black tracking-widest uppercase mb-4">Security Requirement</h5>
                            <p className="text-white/40 text-xs leading-relaxed italic">
                                Multi-signature authorization for admin wallet is highly recommended for individual grants exceeding 1M LXR.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {schedules.length === 0 ? (
                        <div className="col-span-full py-32 tech-card flex flex-col items-center justify-center space-y-6 opacity-40">
                            <Lock className="w-12 h-12" />
                            <p className="text-sm font-medium">No active vesting schedules found</p>
                        </div>
                    ) : (
                        schedules.map((s, idx) => (
                            <div key={idx} className="tech-card p-10 space-y-10 group hover:border-violet-500/30 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-violet-500/10 transition-all">
                                        <ShieldCheck className="w-6 h-6 text-white/40 group-hover:text-violet-500 transition-all" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">ID</p>
                                        <p className="text-xs font-mono text-white mt-1">#{s.pubkey.toBase58().slice(0, 8)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Progress</span>
                                        <span className="text-xs font-mono text-white">
                                            {(s.releasedAmount.toNumber() / 1e9).toLocaleString()} / {(s.totalAmount.toNumber() / 1e9).toLocaleString()} LXR
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-violet-600 rounded-full"
                                            style={{ width: `${(s.releasedAmount.toNumber() / s.totalAmount.toNumber()) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-[9px] text-white/20 font-bold tracking-widest uppercase text-left">Cliff End</p>
                                        <p className="text-xs text-white/60 mt-1">{format(new Date(s.cliffTime.toNumber() * 1000), "PP")}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-white/20 font-bold tracking-widest uppercase text-left">Final Unlock</p>
                                        <p className="text-xs text-white/60 mt-1">{format(new Date(s.endTime.toNumber() * 1000), "PP")}</p>
                                    </div>
                                </div>

                                <button onClick={() => handleClaim(s)} disabled={status === 'loading'} className="w-full py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                                    <Unlock className="w-3.5 h-3.5" />
                                    Claim Released
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
