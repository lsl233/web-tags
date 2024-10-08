import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import { includeTagLevel } from "@/lib/helper.js";
import { WebPage } from "@prisma/client";
import express from "express";
import { CreateWebpage } from "shared/webpage.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const tagsId = req.query.tagsId as string;
  if (!tagsId || tagsId === "") {
    return next(ServerError.BadRequest("tagsId is required"));
  }

  const tagsIdArray = tagsId.split(",");

  const foundWebpages = await db.webPage.findMany({
    where: {
      userId: req.user.id,
      tags: {
        some: {
          id: {
            in: tagsIdArray,
          },
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

const createWebpage = async (webpage: CreateWebpage, userId: string) => {
  const { url, title, description, tags, icon, id } = webpage;

  const data = {
    url,
    title,
    description,
    userId,
    icon,
    tags: {
      set: tags.map((tag: string) => ({ id: tag })),
    },
  };

  const createdWebpage = await db.webPage.upsert({
    where: {
      id,
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
  return createdWebpage;
};

router.post("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const createdWebpage = await createWebpage(req.body, req.user.id)

  res.json(createdWebpage);
});

router.post('/multi', async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const createdWebpages = await db.webPage.createMany({
    data: req.body.map((webpage: CreateWebpage) => ({
      ...webpage,
      userId: req.user.id,
    })),
  });
  res.json(createdWebpages);
})

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
