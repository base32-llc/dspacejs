import fs from "fs";
import { Wallet, web3 } from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";

export const getSolana = async (): Promise<{
    connection: Connection;
    wallet: Wallet;
}> => {
    if (!fs.existsSync("private.key")) {
        const keypair = Keypair.generate();
        fs.writeFileSync("private.key", `[${keypair.secretKey.toString()}]`);
        console.warn(
            `No private key found. Generated new identity ${keypair.publicKey.toBase58()}`
        );
    }
    const pk = Uint8Array.from(
        JSON.parse(fs.readFileSync("private.key").toString())
    );
    const connection = new Connection("https://ssc-dao.genesysgo.net/");
    const wallet = new Wallet(web3.Keypair.fromSecretKey(new Uint8Array(pk)));

    console.log(`Loaded identity ${wallet.publicKey.toBase58()}`);

    return {
        connection,
        wallet,
    };
};
