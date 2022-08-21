import { Wallet } from "@project-serum/anchor";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection } from "@solana/web3.js";

export interface Account {
    connection: Connection;
    wallet: Wallet;
}
