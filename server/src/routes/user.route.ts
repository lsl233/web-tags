import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { $Enums, TagType } from "@prisma/client";

const router = express.Router();

router.get("/session", async (req, res, next) => {
  const session = req.user;

  if (!session) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  res.json(session);
});

const mergeUser = async (userId: string, guestId: string) => {
  await db.webPage.updateMany({
    where: {
      userId: guestId
    },
    data: {
      userId
    }
  })

  const updatedTags = await db.tag.updateMany({
    where: {
      userId: guestId
    },
    data: {
      userId
    }
  })
}

router.post("/session", async (req, res, next) => {
  const { email, password, guestId } = req.body;

  const foundUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!foundUser) {
    return next(ServerError.BadRequest("Invalid email or password"));
  }
  // TODO use bcrypt
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (hashedPassword !== foundUser.password) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const token = jwt.sign(
    {
      id: foundUser.id,
      type: foundUser.type,
      email: foundUser.email,
    },
    process.env.JWT_SECRET as string,
    {
      // TODO: 双 Token
      expiresIn: "7d",
    }
  );

  res.json(token);
});

router.post("/guest", async (req, res, next) => {
  const createdTourist = await db.user.create({
    data: {
      type: $Enums.UserType.NORMAL
    }
  })
  res.json(createdTourist)
})


router.post("/", async (req, res, next) => {
  const { email, password, guestId } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const foundUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (foundUser) {
    return next(ServerError.BadRequest("User already exists"));
  }

  const createdUser = await db.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  if (guestId) {
    await mergeUser(createdUser.id, guestId)
  } else {
    await db.tag.create({
      data: {
        name: "Inbox",
        icon: '',
        type: TagType.INBOX,
        sortOrder: 1,
        user: { connect: { id: createdUser.id } },
      },
    });
  }

  res.json(createdUser);
});

export default router;
