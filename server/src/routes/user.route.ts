import { db } from "@/lib/db.js";
import ServerError from "@/lib/error.js";
import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TagType } from "@prisma/client";

const router = express.Router();

router.get("/session", async (req, res, next) => {
  const session = req.user;

  if (!session) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }
  res.json(session);
});

router.post("/session", async (req, res, next) => {
  const { email, password } = req.body;
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

  const isPasswordCorrect = crypto.timingSafeEqual(
    Buffer.from(foundUser.password),
    Buffer.from(hashedPassword)
  );

  if (!isPasswordCorrect) {
    return next(ServerError.Unauthorized("Unauthorized"));
  }

  const token = jwt.sign(
    {
      id: foundUser.id,
      email: foundUser.email,
    },
    process.env.JWT_SECRET as string,
    {
      // TODO: 双 Token
      expiresIn: "1h",
    }
  );

  res.json(token);
});


router.post("/", async (req, res, next) => {
  const { email, password } = req.body;
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

  await db.tag.create({
    data: {
      name: "Inbox",
      type: TagType.DATE,
      sortOrder: 1,
      user: { connect: { id: createdUser.id } },
    },
  });

  res.json(createdUser);
});

export default router;
