import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import { includeTagLevel } from "@/lib/helper.js";
import { $Enums, WebPage } from "@prisma/client";
import express from "express";
import { CreateWebpage } from "shared/webpage.js";

const router = express.Router();

interface GetWebpageQuery {
  tagsId: string
  page: number | undefined
  pageSize: number | undefined
}
router.get<null, any, null, GetWebpageQuery>("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { tagsId, page = 1, pageSize = 20 } = req.query;

  if (!tagsId || tagsId === "") {
    return next(ServerError.BadRequest("tagsId is required"));
  }

  const tagsIdArray = tagsId.split(",");

  const foundWebpages = await db.webPage.findMany({
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
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
    orderBy: {
      sortOrder: 'asc'
    }
  });
  res.json(foundWebpages);
});

const createWebpage = async (webpage: CreateWebpage, userId: string) => {
  const { url, title, description, tags, icon, id = "" } = webpage;

  const data = {
    url,
    title,
    description,
    userId,
    icon,
    tags: {
      set: tags.map((id: string) => ({ id })),
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

router.get('/multi', async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const urls = req.query.urls as string;
  const urlsArray = urls.split(',');

  const foundWebpages = await db.webPage.findMany({
    where: {
      url: {
        in: urlsArray,
      },
      userId: req.user.id,
    },
    include: {
      tags: true,
    },
  });

  res.json(foundWebpages);
})

router.post('/multi', async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const webpages: CreateWebpage[] = req.body

  const createdWebpages = await db.$transaction(webpages.map((webpage) => {
    return db.webPage.upsert({
      where: {
        id: webpage.id || ""
      },
      create: {
        url: webpage.url,
        title: webpage.title,
        description: webpage.description,
        icon: webpage.icon,
        tags: {
          connect: webpage.tags.map((id: string) => ({ id })),
        },
        userId: req.user.id,
      },
      update: {
        title: webpage.title,
        description: webpage.description,
        tags: {
          connect: webpage.tags.map((id: string) => ({ id })),
        },
      }
    })
  }))

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
  const url = decodeURIComponent(req.query.url as string);
  const foundWebpage = await db.webPage.findFirst({
    where: {
      url,
      userId: req.user.id,
    },
    include: {
      tags: true,
    },
  });
  res.json(foundWebpage);
});

router.post("/sort-order", async (req, res, next) => {
  const sortedWebpages = req.body
  await db.$transaction(
    sortedWebpages.map((webpage: { id: string; sortOrder: number; }) =>
      db.webPage.update({
        where: { id: webpage.id },
        data: { sortOrder: webpage.sortOrder },
      })
    )
  );
  res.json({ message: 'ok' })
})

export default router;
