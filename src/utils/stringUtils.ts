import { PublicKey } from "@solana/web3.js";

/**
 * Helper function to parse either a pubkey or string pubkey as a pubkey
 *
 * @param pubkey
 * @returns
 */
export function getKeyAsBytes(pubkey: PublicKey | string): PublicKey {
    return typeof pubkey === "string" ? new PublicKey(pubkey) : pubkey;
}

/**
 * Helper function to parse either a pubkey or string pubkey as a string
 *
 * @param pubkey
 * @returns
 */
export function getKeyAsString(pubkey: PublicKey | string) {
    return typeof pubkey === "string" ? pubkey : new PublicKey(pubkey);
}

/**
 * Helper function to convert a storage account pubkey and file identifier to a URL
 *
 * @param storageAccount
 * @param identifier
 * @returns
 */
export function getURL(storageAccount: PublicKey | string, identifier: string) {
    return `https://shdw-drive.genesysgo.net/${getKeyAsString(
        storageAccount
    )}/${encodeURIComponent(identifier)}`;
}
