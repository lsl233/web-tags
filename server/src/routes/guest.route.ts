import { db } from "@/lib/db.js"
import ServerError from "@/lib/error.js";
import { $Enums } from "@prisma/client"
import express from "express"
import jwt from "jsonwebtoken";


const router = express.Router();

router.post("/", async (req, res, next) => {
  const createdTourist = await db.user.create({
    data: {
      type: $Enums.UserType.GUEST
    }
  })
  res.json(createdTourist)
})


router.post("/session", async (req, res, next) => {
  const { id } = req.body;

  if (!id) return next(ServerError.BadRequest("Invalid id"))

  const foundGuest = await db.user.findUnique({
    where: { id }
  })
  if (!foundGuest) {
    return next(ServerError.NotFound("Not found guest"));
  }

  const token = jwt.sign(
    {
      id: foundGuest.id,
      type: foundGuest.type,
      email: 'Tourist@your.com',
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  res.json(token);
  return

})

export default router