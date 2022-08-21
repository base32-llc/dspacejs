import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import log from "electron-log";
import { Account } from "./types";
import { Drive } from "./drive";

export const getAPI = (account: Account, drive: Drive) => {
    const app = express();
    app.use(helmet());
    app.use(express.json());
    app.use(morgan("dev"));

    app.get("/info", (req, res) => {
        res.json({
            pubkey: account.wallet.publicKey.toBase58(),
            drive: drive.driveKey.toBase58(),
        });
    });

    app.listen(process.env.API_PORT, () => {
        log.info("Started API on port " + process.env.API_PORT);
    });

    return app;
};
