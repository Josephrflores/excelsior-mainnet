const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const connection = new Connection("https://api.devnet.solana.com");
const LXR_MINT = new PublicKey("7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth");
const XLS_MINT = new PublicKey("GM4vKHRrqg84mKRixpVr5FuLUNL45b5dFLqcYQQpwoki");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const ORPHAN1 = "4zCLGRhCs5EboatAbgmhyC9UNNLibffcEcooRCUx76q1";
const ORPHAN2 = "2vo6ex1xaNpKoauhHLm9Vr4wUTJ4kADTafSmCTJvegNg";

async function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
                if (Array.isArray(data) && data.length === 64) {
                    const kp = Keypair.fromSecretKey(new Uint8Array(data));
                    const addr = kp.publicKey.toBase58();

                    if (addr === ORPHAN1 || addr === ORPHAN2) {
                        console.log(`!!! MATCH FOUND: ${fullPath} is ${addr}`);
                    }

                    const accounts = await connection.getParsedTokenAccountsByOwner(kp.publicKey, { programId: TOKEN_2022_PROGRAM_ID });
                    let lxrVal = 0;
                    let xlsVal = 0;

                    accounts.value.forEach(acc => {
                        const info = acc.account.data.parsed.info;
                        if (info.mint === LXR_MINT.toBase58()) lxrVal += info.tokenAmount.uiAmount || 0;
                        if (info.mint === XLS_MINT.toBase58()) xlsVal += info.tokenAmount.uiAmount || 0;
                    });

                    if (lxrVal > 0 || xlsVal > 0) {
                        console.log(`BALANCE: ${fullPath} (${addr}) | LXR: ${lxrVal} | XLS: ${xlsVal}`);
                    }
                }
            } catch (e) {
                // Not a keypair or parse error
            }
        }
    }
}

console.log("Starting Recursive Audit of 'llaves'...");
scan("/home/itsroosevelt_/excelsior-project/smart-contracts/llaves").then(() => {
    console.log("Audit complete.");
}).catch(console.error);
