
import { PublicKey } from "@solana/web3.js";

export type EnvType = "devnet" | "mainnet" | "testnet";

export interface EnvConfig {
    name: string;
    rpcUrl: string;
    programId: PublicKey;
    adminAddress: PublicKey;
    lxrMint: PublicKey;
    xlsMint: PublicKey;
    usdxMint: PublicKey; // New USDX Token
    usdxReserve: PublicKey; // USDX Collateral Vault
    explorerUrl: string;
    jupiterApi: string;
    multisigAddress: PublicKey;
    squadsDashboardUrl: string;
}

export const ENVIRONMENTS: Record<EnvType, EnvConfig> = {
    devnet: {
        name: "Devnet",
        rpcUrl: "https://api.devnet.solana.com",
        programId: new PublicKey("BqmCp11bN5aDF6XdCEEnLUZroxTPMod6xrap78zKmvap"),
        adminAddress: new PublicKey("7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"),
        lxrMint: new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth"),
        xlsMint: new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki"),
        usdxMint: new PublicKey("11111111111111111111111111111111"), // Placeholder for USDX Devnet
        usdxReserve: new PublicKey("11111111111111111111111111111111"), // Placeholder for USDX Reserve
        explorerUrl: "https://explorer.solana.com/?cluster=devnet",
        jupiterApi: "https://quote-api.jup.ag/v6",
        multisigAddress: new PublicKey("7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"), // Devnet Multisig (Owner for now)
        squadsDashboardUrl: "https://v4.squads.so/squads/",
    },
    mainnet: {
        name: "Mainnet",
        rpcUrl: "https://api.mainnet-beta.solana.com",
        programId: new PublicKey("BqmCp11bN5aDF6XdCEEnLUZroxTPMod6xrap78zKmvap"), // TODO: Update for Mainnet
        adminAddress: new PublicKey("7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"), // TODO: Update for Mainnet
        lxrMint: new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth"), // TODO: Update for Mainnet
        xlsMint: new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki"), // TODO: Update for Mainnet
        usdxMint: new PublicKey("11111111111111111111111111111111"), // Placeholder for USDX Mainnet
        usdxReserve: new PublicKey("11111111111111111111111111111111"), // Placeholder for USDX Reserve
        explorerUrl: "https://explorer.solana.com/",
        jupiterApi: "https://quote-api.jup.ag/v6",
        multisigAddress: new PublicKey("7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"), // TODO: Update for Mainnet Multisig
        squadsDashboardUrl: "https://v4.squads.so/squads/",
    },
    testnet: {
        name: "Testnet",
        rpcUrl: "https://api.testnet.solana.com",
        programId: new PublicKey("BqmCp11bN5aDF6XdCEEnLUZroxTPMod6xrap78zKmvap"), // Placeholder
        adminAddress: new PublicKey("7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"), // Placeholder
        lxrMint: new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth"), // Placeholder
        xlsMint: new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki"), // Placeholder
        usdxMint: new PublicKey("11111111111111111111111111111111"),
        usdxReserve: new PublicKey("11111111111111111111111111111111"),
        explorerUrl: "https://explorer.solana.com/?cluster=testnet",
        jupiterApi: "https://quote-api.jup.ag/v6",
        multisigAddress: new PublicKey("7EdDpmBEvhw1v79ysqQrEK7iHDVzBaRPuwnUDP2vu3Lk"),
        squadsDashboardUrl: "https://v4.squads.so/squads/",
    }
};

export const DEFAULT_ENV: EnvType = "devnet";
