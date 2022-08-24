import { Wallet } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";

export interface Account {
    connection: Connection;
    wallet: Wallet;
}

export interface User {
    username: string;
    pubkey: string;
    pfp: string;
}
