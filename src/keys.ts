import { Keys } from "./types";
import fs from "fs";
import msgpack from "msgpack-lite";
import { box } from "tweetnacl";
import log from "electron-log";
import { encode as encode64 } from "@stablelib/base64";

export const getKeys = (): Keys => {
    if (!fs.existsSync("private.key")) {
        const keypair = box.keyPair();
        const data: Keys = {
            public: keypair.publicKey,
            private: keypair.secretKey,
        };
        fs.writeFileSync("private.key", msgpack.encode(data));
    }
    const keys: Keys = msgpack.decode(fs.readFileSync("private.key"));
    log.info("Initialized identity " + encode64(keys.public));
    return keys;
};
