import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { User } from "./types";
import { Connection, PublicKey } from "@solana/web3.js";
import { APP_NAME, SHDW_DRIVE_VERSION } from "./constants";
import { Wallet } from "@project-serum/anchor";
import { randomUsername } from "./utils/randomUsername";
import axios from "axios";
import { getKeyAsBytes, getURL } from "./utils/stringUtils";
import { isNode, isBrowser } from "browser-or-node";

export class Client {
    public shdw: ShdwDrive;
    public driveKey: PublicKey;

    public static getDrive(connection: Connection, wallet: Wallet) {
        return new ShdwDrive(connection, wallet).init();
    }

    private static getPayload(
        data: any,
        identifier: string
    ): File | ShadowFile {
        if (isNode) {
            return {
                name: identifier,
                file: Buffer.from(JSON.stringify(data)),
            };
        }
        if (isBrowser) {
            return new File([JSON.stringify(data)], identifier, {
                type: "application/json",
            });
        }
        throw new Error("Unsupported environment");
    }

    public static async isRegistered(
        connection: Connection,
        wallet: Wallet
    ): Promise<boolean> {
        const shdw = await new ShdwDrive(connection, wallet).init();

        const storageAccounts = await shdw.getStorageAccounts(
            SHDW_DRIVE_VERSION
        );

        let driveKey: PublicKey | null = null;
        for (const acc of storageAccounts) {
            if (acc.account.identifier === APP_NAME) {
                driveKey = acc.publicKey;
            }
        }

        return driveKey ? true : false;
    }

    public static async create(connection: Connection, wallet: Wallet) {
        const shdw = await new ShdwDrive(connection, wallet).init();

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
            console.warn(
                "Drive not found, creating new one. This can take a while."
            );
            const created = await shdw.createStorageAccount(
                APP_NAME,
                "10MB",
                SHDW_DRIVE_VERSION
            );
            console.log("Created drive " + created.shdw_bucket);
            driveKey = new PublicKey(created.shdw_bucket);
        }

        console.log("Initialized drive " + driveKey.toBase58());

        // check if user metadata exists
        const identifiers = await shdw.listObjects(driveKey);
        if (!identifiers.keys.includes("user.json")) {
            const user: User = {
                username: randomUsername(),
                pubkey: driveKey.toBase58(),
            };
            await shdw.uploadFile(
                driveKey,
                Client.getPayload(user, "user.json"),
                SHDW_DRIVE_VERSION
            );
        }

        return new Client(shdw, driveKey);
    }

    private constructor(shdw: ShdwDrive, driveKey: PublicKey) {
        this.shdw = shdw;
        this.driveKey = driveKey;
    }

    private async getFile(identifier: string) {
        const files = await this.shdw.listObjects(getKeyAsBytes(this.driveKey));

        for (const key of files.keys) {
            if (key.includes(identifier)) {
                const res = await axios.get(getURL(this.driveKey, identifier));
                return res.data;
            }
        }

        return null;
    }

    public async upload(data: any, identifier: string) {
        await this.shdw.uploadFile(
            this.driveKey,
            Client.getPayload(data, identifier),
            SHDW_DRIVE_VERSION
        );
    }

    public async getUserInfo(): Promise<User> {
        const user = await this.getFile("user.json");
        if (!user) {
            throw new Error("Required user metadata not found");
        }
        return user as User;
    }

    public async setUsername(username: string) {
        const user = await this.getUserInfo();
        if (!user) {
            throw new Error("User not found");
        }
        user.username = username;
        await this.shdw.editFile(
            this.driveKey,
            getURL(this.driveKey, "user.json"),
            {
                name: "user.json",
                file: Buffer.from(JSON.stringify(user)),
            },
            SHDW_DRIVE_VERSION
        );
    }
}
