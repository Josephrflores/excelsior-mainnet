import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getAccount, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import fs from "fs";
import path from "path";

const CONNECTION = new Connection("https://api.devnet.solana.com", "confirmed");
const WALLETS_DIR = "/home/itsroosevelt_/excelsior-project/smart-contracts/wallets";
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");

async function checkBalance(filePath: string) {
    try {
        const secret = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const keypair = Keypair.fromSecretKey(new Uint8Array(secret));
        const pubkey = keypair.publicKey;

        const solBalance = await CONNECTION.getBalance(pubkey);

        let xlsBalance = "0";
        try {
            const xlsAta = await getAssociatedTokenAddress(XLS_MINT, pubkey, false, TOKEN_2022_PROGRAM_ID);
            const account = await getAccount(CONNECTION, xlsAta, "confirmed", TOKEN_2022_PROGRAM_ID);
            xlsBalance = (Number(account.amount) / 1e9).toString();
        } catch (e) { }

        let lxrBalance = "0";
        try {
            const lxrAta = await getAssociatedTokenAddress(LXR_MINT, pubkey, false, TOKEN_2022_PROGRAM_ID);
            const account = await getAccount(CONNECTION, lxrAta, "confirmed", TOKEN_2022_PROGRAM_ID);
            lxrBalance = (Number(account.amount) / 1e9).toString();
        } catch (e) { }

        return {
            name: path.basename(filePath),
            address: pubkey.toBase58(),
            sol: solBalance / 1e9,
            xls: xlsBalance,
            lxr: lxrBalance
        };
    } catch (e) {
        return null;
    }
}

async function main() {
    const files = fs.readdirSync(WALLETS_DIR).filter(f => f.endsWith(".json"));
    const results = [];

    console.log("| Wallet | Address | SOL | XLS | LXR | Status |");
    console.log("|--------|---------|-----|-----|-----|--------|");

    for (const file of files) {
        const res = await checkBalance(path.join(WALLETS_DIR, file));
        if (res) {
            const isOrphan = res.sol === 0 && res.xls === "0" && res.lxr === "0";
            console.log(`| ${res.name} | ${res.address} | ${res.sol} | ${res.xls} | ${res.lxr} | ${isOrphan ? "⚠️ Huérfana" : "✅ Activa"} |`);
        }
    }
}

main();
