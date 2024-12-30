import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import { includeTagLevel } from "@/lib/helper.js";
import { Prisma } from "@prisma/client";
import express from "express";
import * as tagServices from '../services/tag.js'

const router = express.Router();

// user tags
router.get("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const foundTags = await db.tag.findMany({
    where: {
      userId: req.user.id,
      parentId: null,
    },
    include: {
      children: {
        orderBy: [
          {sortOrder: 'asc'},
          {createdAt: 'desc'}
        ],
        include: {
          children: {
            orderBy: [
              {sortOrder: 'asc'},
              {createdAt: 'desc'}
            ],
            include: {
              children: {
                orderBy: [
                  {sortOrder: 'asc'},
                  {createdAt: 'desc'}
                ],
              },
            },
          },
        },
      },
    },
    orderBy: [
      {sortOrder: 'asc'},
      {createdAt: 'desc'}
    ],
  });

  res.json(foundTags);
});

// create or update tag
router.post("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { name, id, icon, type, parentId } = req.body;

  if (id) {
    // 更新现有标签
    const updatedTag = await db.tag.update({
      where: { id, userId: req.user.id },
      data: { name, icon, parentId: parentId || undefined },
    });
    res.json(updatedTag);
  } else {
    // 创建新标签
    const existingTag = await db.tag.findFirst({
      where: {
        name,
        icon,
        userId: req.user.id,
      },
    });
    if (existingTag) {
      return next(ServerError.BadRequest("Tag already exists"));
    }
    const createdTag = await db.tag.create({
      data: {
        name,
        icon,
        type,
        user: {
          connect: {
            id: req.user.id,
          },
        },
        ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
      },
      include: {
        children: true,
      }
    });
    res.json(createdTag);
  }
});

// delete tag
router.delete("/:id", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { id } = req.params;

  try {
    // 开始一个事务
    const result = await db.$transaction(async (tx) => {
      // 首先解除该标签与所有网页的关联
      await tx.tag.update({
        where: { id, userId: req.user.id },
        data: {
          webPages: {
            set: [], // 清空关联
          },
        },
      });

      // 然后删除标签本身
      const deletedTag = await tx.tag.delete({
        where: { id, userId: req.user.id },
      });

      setImmediate(async () => {
        try {
          const deletedWebPages = await db.webPage.deleteMany({
            where: {
              userId: req.user.id,
              tags: {
                none: {},
              },
            },
          });
          console.log(
            `Deleted ${deletedWebPages.count} web pages without tags.`
          );
        } catch (error) {
          console.error("Error deleting web pages without tags:", error);
        }
      });

      return deletedTag;
    });

    res.json(result);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return next(ServerError.NotFound("Tag not found"));
    }
    next(error);
  }
});

// TODO ai generate tag
router.post("/recommend", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { title, description, tags } = req.body;

  const recommendTags = await tagServices.recommendTags(title, description, tags)
  res.json(recommendTags)

});

router.post("/sort-order", async (req, res, next) => {
  const sortedTags = req.body
  await db.$transaction(
    sortedTags.map((tag: { id: string; sortOrder: number; }) =>
      db.tag.update({
        where: { id: tag.id },
        data: { sortOrder: tag.sortOrder },
      })
    )
  );
  res.json({message: 'ok'})
})

export default router;
