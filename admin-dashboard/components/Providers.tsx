"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SessionProvider } from "next-auth/react";
import { EnvProvider, useEnv } from "@/components/providers/EnvProvider";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

const SolanaProviders = ({ children }: { children: React.ReactNode }) => {
    const { config } = useEnv();
    const endpoint = useMemo(() => config.rpcUrl, [config.rpcUrl]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <EnvProvider>
                <SolanaProviders>
                    {children}
                </SolanaProviders>
            </EnvProvider>
        </SessionProvider>
    );
};
