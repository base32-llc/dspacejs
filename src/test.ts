import { getSolana } from "./solana";
import { Client } from "./client";
import { randomUsername } from "./utils/randomUsername";

// start the modules
async function main() {
    const { connection, wallet } = await getSolana();

    if (await Client.isRegistered(connection, wallet)) {
        console.log("Already registered");
    }

    const client = await Client.create(connection, wallet);
}

main();
