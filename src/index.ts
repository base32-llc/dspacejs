import { loadEnv } from "./utils/loadEnv";
import { getSolana } from "./solana";
import { Client } from "./client";
import log from "electron-log";
import { getURL } from "./utils/stringUtils";

// load the environment variables
loadEnv();

// start the modules
async function main() {
    const { connection, wallet } = await getSolana();
    const client = await Client.create(connection, wallet);
    log.info("Logged in as " + (await client.getUserInfo())?.username);
}

main();
