import { getAPI } from "./api";
import { loadEnv } from "./utils/loadEnv";
import { getAccount } from "./keys";
import { Drive } from "./drive";

// load the environment variables
loadEnv();

// start the modules
async function main() {
    const account = await getAccount();
    const drive = await Drive.create(account);
    const app = getAPI(account, drive);
}

main();
