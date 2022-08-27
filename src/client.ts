import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { Link, User } from "./types";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { APP_NAME, SHDW_DRIVE_VERSION, SHDW_TOKEN_CONTRACT } from "./constants";
import { Wallet } from "@project-serum/anchor";
import { randomUsername } from "./utils/randomUsername";
import axios from "axios";
import { getKeyAsBytes, getURL } from "./utils/stringUtils";
import { isNode, isBrowser } from "browser-or-node";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { fileToBase64String } from "./utils/fileToBase64";

export class Client {
    public shdw: ShdwDrive;
    public driveKey: PublicKey;
    private connection: Connection;
    private wallet: Wallet;
    /**
     * Helper function to retrieve the user's balance of $SHDW
     * and $SOL tokens
     *
     * @returns
     */
    public static async getBalances(
        connection: Connection,
        wallet: Wallet
    ): Promise<{
        SHDW: number;
        SOL: number;
    }> {
        const solBalance = await connection.getBalance(wallet.publicKey); // Get the user's SOL balance
        let shdwBalance = 0.0;

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey,
            { programId: TOKEN_PROGRAM_ID }
        );
        for (const acc of tokenAccounts.value) {
            if (
                acc.account.data.parsed.info.mint ===
                SHDW_TOKEN_CONTRACT.toBase58()
            ) {
                const bal = await connection.getTokenAccountBalance(acc.pubkey);
                if (bal.value.uiAmount) shdwBalance = bal.value.uiAmount;
            }
        }
        return {
            SHDW: shdwBalance,
            SOL: solBalance / LAMPORTS_PER_SOL,
        };
    }

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

        return new Client(shdw, driveKey, wallet, connection);
    }

    private constructor(
        shdw: ShdwDrive,
        driveKey: PublicKey,
        wallet: Wallet,
        connection: Connection
    ) {
        this.connection = connection;
        this.wallet = wallet;
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
            Client.getPayload(user, "user.json"),
            SHDW_DRIVE_VERSION
        );
    }

    public async setPFP(file: File) {
        const user = await this.getUserInfo();
        if (!user) {
            throw new Error("User not found");
        }
        user.pfp = await fileToBase64String(file, "image/webp");
        await this.shdw.editFile(
            this.driveKey,
            getURL(this.driveKey, "user.json"),
            Client.getPayload(user, "user.json"),
            SHDW_DRIVE_VERSION
        );
    }

    public async setLinks(links: Link[]) {
        const user = await this.getUserInfo();
        if (!user) {
            throw new Error("User not found");
        }
        user.links = links;
        await this.shdw.editFile(
            this.driveKey,
            getURL(this.driveKey, "user.json"),
            Client.getPayload(user, "user.json"),
            SHDW_DRIVE_VERSION
        );
    }
}
