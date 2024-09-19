import { Tag as PrismaTag, Prisma } from "server/node_modules/@prisma/client";
import { z } from "zod";

export type TagWithWebpagesAndTags = Prisma.TagGetPayload<{
  include: {
    webPages: {
      include: {
        tags: true
      }
    }
  };
}>;

export type Tag = PrismaTag;

export const tagSchema = z.object({
  name: z.string().min(1, { message: "Please fill in the tag name" }).max(8, { message: "Tag name cannot exceed 8 characters" }),
  icon: z.string(),
});