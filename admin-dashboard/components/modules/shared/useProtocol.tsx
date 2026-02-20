
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "@/lib/idl/excelsior.json";
import { useEnv } from "@/components/providers/EnvProvider";

export const PROGRAM_ID = new PublicKey("CihitmkdTdh48gvUZSjU7rZ8EARQksJNxspwnRu7ZhAp");
export const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
export const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");

export const useProtocol = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { config: envConfig, isSimulation } = useEnv();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [moduleFlags, setModuleFlags] = useState<number>(1);
    const [configData, setConfigData] = useState<any>(null);

    const getProgram = () => {
        if (!envConfig || !wallet) return null;
        const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
        return new Program(idl as any, envConfig.programId, provider);
    };

    const fetchGlobalFlags = async () => {
        if (!envConfig || !wallet.publicKey) return;
        try {
            const program = getProgram();
            if (!program) return;

            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("global_config")],
                program.programId
            );
            const data: any = await (program.account as any).GlobalConfig.fetch(configPda);
            setModuleFlags(data.moduleFlags);
            setConfigData(data);
        } catch (e) {
            console.error("Failed to fetch global flags:", e);
        }
    };

    // Auto-fetch on mount
    useState(() => {
        fetchGlobalFlags();
    });

    return {
        connection,
        wallet,
        status,
        setStatus,
        message,
        setMessage,
        getProgram,
        config: envConfig,
        moduleFlags,
        configData,
        isSimulation,
        fetchGlobalFlags
    };
};
