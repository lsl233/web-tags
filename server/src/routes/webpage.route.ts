import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
 
  const foundWebpages = await db.webPage.findMany({
    where: {
      userId: req.user.id,
      tags: {
        some: {
          id: req.query.tagId as string,
        },
      },
    },
    include: {
      tags: true,
    },
  });
  res.json(foundWebpages);
});

router.post("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const { url, title, description, tags, icon } = req.body;
  // TODO url 唯一性判断
  const createdWebpage = await db.webPage.create({
    data: {
      url,
      title,
      description,
      userId: req.user.id,
      icon,
      tags: {
        connect: tags.map((tag: string) => ({ id: tag })),
      },
    },
    include: {
      tags: true,
    },
  });

  res.json(createdWebpage);
});

export default router;
