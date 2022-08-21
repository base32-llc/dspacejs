import { getAPI } from "./api";
import { loadEnv } from "./utils/loadEnv";
import { getKeys } from "./keys";

// load the environment variables
loadEnv();

// start the modules
export const keys = getKeys();
export const api = getAPI();
