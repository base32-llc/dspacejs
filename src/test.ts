import { getSolana } from "./solana";
import { Client } from "./client";
import { randomUsername } from "./utils/randomUsername";

// start the modules
async function main() {
    console.log(randomUsername());

    const { connection, wallet } = await getSolana();
    const client = await Client.create(connection, wallet);

    const user = await client.getUserInfo();
    console.log("Logged in as " + user.username);
}

main();
