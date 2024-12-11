import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import express from "express";

const router = express.Router();

router.get("/", async (req, res, next) => {
    const session = req.user;

    if (!session) {
        return next(ServerError.Unauthorized("Unauthorized"));
    }
    
    const settings = await db.settings.findFirst({
        where: {
            userId: req.user.id
        }
    });
    res.json(settings);
});

router.post("/", async (req, res, next) => {
    const session = req.user;

    if (!session) {
        return next(ServerError.Unauthorized("Unauthorized"));
    }
    const data = req.body;

    const id = data.id || "";

    const settings = await db.settings.upsert({
        where: {
            userId: session.id
        },
        update: {
            settingsJson: data.settingsJson
        },
        create: {
            settingsJson: data.settingsJson,
            user: {
                connect: {
                    id: session.id
                }
            }
        }
    });
    res.json(settings);
});

export default router;
