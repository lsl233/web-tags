import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import { Prisma } from "@prisma/client";
import express from "express";

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const query = req.query
  const include: Prisma.TagInclude = {}
  if (query.includeWebPagesAndTags === "true") {
    include.webPages = {
      include: {
        tags: true,
      },
    }
  }
  const foundTags = await db.tag.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include,
  });

  res.json(foundTags);
});

router.post("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { name } = req.body;
  const existingTag = await db.tag.findFirst({
    where: {
      name,
      userId: req.user.id,
    },
  });
  if (existingTag) {
    return next(ServerError.BadRequest("Tag already exists"));
  }
  // TODO 唯一性判断
  const createdTag = await db.tag.create({
    data: {
      name,
      user: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });
  res.json(createdTag);
});

export default router;
