import { ShdwDrive } from "@shadow-drive/sdk";
import { Account } from "./types";
import log from "electron-log";
import { PublicKey } from "@solana/web3.js";
import { APP_NAME, SHDW_DRIVE_VERSION } from "./constants";

export class Drive {
    private shdw: ShdwDrive;
    public driveKey: PublicKey;

    public static async create(account: Account) {
        const shdw = await new ShdwDrive(
            account.connection,
            account.wallet
        ).init();

        const storageAccounts = await shdw.getStorageAccounts(
            SHDW_DRIVE_VERSION
        );

        let driveKey: PublicKey | null = null;

        for (const acc of storageAccounts) {
            if (acc.account.identifier === APP_NAME) {
                driveKey = acc.publicKey;
            }
        }

        // create the account if it doesn't exist
        if (!driveKey) {
            log.warn(
                "Drive not found, creating new one. This can take a while."
            );
            const created = await shdw.createStorageAccount(
                APP_NAME,
                "10MB",
                SHDW_DRIVE_VERSION
            );
            log.info("Created drive " + created.shdw_bucket);
            driveKey = new PublicKey(created.shdw_bucket);
        }

        log.info("Initialized drive " + driveKey.toBase58());

        return new Drive(shdw, driveKey);
    }

    private constructor(shdw: ShdwDrive, driveKey: PublicKey) {
        this.shdw = shdw;
        this.driveKey = driveKey;
    }
}
