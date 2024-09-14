import { Tag as PrismaTag, Prisma } from "server/node_modules/@prisma/client";

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