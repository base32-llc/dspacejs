import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import log from "electron-log";
import { keys } from ".";
import { encode as encode64 } from "@stablelib/base64";

export const getAPI = () => {
    const app = express();
    app.use(helmet());
    app.use(express.json());
    app.use(morgan("dev"));

    app.get("/info", (req, res) => {
        res.json({
            pubkey: encode64(keys.public),
        });
    });

    app.listen(process.env.API_PORT, () => {
        log.info("Started API on port " + process.env.API_PORT);
    });

    return app;
};
