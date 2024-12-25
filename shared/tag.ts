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

export type TagWithLevel = Tag & {
  level: number;
}

export type TagWithChildrenAndParent = Tag & {
  children: TagWithChildrenAndParentAndLevel[];
  parent: TagWithChildrenAndParentAndLevel;
}

export type TagWithChildrenAndParentAndLevel = TagWithChildrenAndParent & {
  level: number;
  
};

export enum TagType {
  INBOX = "INBOX",
  DATE = "DATE",
  CUSTOM = "CUSTOM",
}

export const tagSchema = z.object({
  parentId: z.array(z.string()).optional(),
  name: z.string().min(1, { message: "Please fill in the tag name" }).max(8, { message: "Tag name cannot exceed 8 characters" }),
  icon: z.string(),
});

export type TagWithId = z.infer<typeof tagSchema> & { id: string };


