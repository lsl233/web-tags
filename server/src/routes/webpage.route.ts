import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import { includeTagLevel } from "@/lib/helper.js";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  if (
    !req.query.tagId ||
    req.query.tagId === "" ||
    req.query.tagId === "undefined"
  ) {
    return next(ServerError.BadRequest("tagId is required"));
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
      tags: {
        include: includeTagLevel
      },
    },
  });
  res.json(foundWebpages);
});

router.post("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const { url, title, description, tags, icon } = req.body;

  const data = {
    url,
    title,
    description,
    userId: req.user.id,
    icon,
    tags: {
      set: tags.map((tag: string) => ({ id: tag })),
    },
  };

  const createdWebpage = await db.webPage.upsert({
    where: {
      id: req.body.id as string,
    },
    update: data,
    create: {
      ...data,
      tags: {
        connect: data.tags.set,
      },
    },
    include: {
      tags: true,
    },
  });

  res.json(createdWebpage);
});

router.delete("/:id", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { id } = req.params;
  const deletedWebpage = await db.webPage.delete({
    where: { id, userId: req.user.id },
  });
  res.json(deletedWebpage);
});

router.get("/exist", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { url } = req.query;
  const foundWebpage = await db.webPage.findFirst({
    where: {
      url: url as string,
      userId: req.user.id,
    },
    include: {
      tags: true,
    },
  });
  res.json(foundWebpage);
});

export default router;
