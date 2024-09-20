import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import { Prisma } from "@prisma/client";
import express from "express";

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const foundTags = await db.tag.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(foundTags);
});

router.post("/", async (req, res, next) => {
  if (!req.user) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  const { name, id, icon } = req.body;

  if (id) {
    // 更新现有标签
    const updatedTag = await db.tag.update({
      where: { id, userId: req.user.id },
      data: { name, icon },
    });
    res.json(updatedTag);
  } else {
    // 创建新标签
    const existingTag = await db.tag.findFirst({
      where: {
        name,
        userId: req.user.id,
      },
    });
    if (existingTag) {
      return next(ServerError.BadRequest("Tag already exists"));
    }
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
  }
});

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

export default router;
