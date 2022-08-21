import fs from "fs";
import log from "electron-log";
import * as anchor from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { ShdwDrive } from "@shadow-drive/sdk";

export const getAccount = async () => {
    if (!fs.existsSync("private.key")) {
        const keypair = Keypair.generate();
        fs.writeFileSync("private.key", `[${keypair.secretKey.toString()}]`);
        log.warn(
            `No private key found. Generated new identity ${keypair.publicKey.toBase58()}`
        );
    }
    const pk = Uint8Array.from(
        JSON.parse(fs.readFileSync("private.key").toString())
    );
    const connection = new Connection("https://ssc-dao.genesysgo.net/");
    const wallet = new anchor.Wallet(
        anchor.web3.Keypair.fromSecretKey(new Uint8Array(pk))
    );

    log.info(`Loaded identity ${wallet.publicKey.toBase58()}`);

    return {
        connection,
        wallet,
    };
};
