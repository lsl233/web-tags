import { object, string, array, z } from "zod";
import type { WebPage as PrismaWebpage, Prisma } from "server/node_modules/@prisma/client";
import { TagWithChildrenAndParentAndLevel } from "./tag";

export const webpageFormData = object({
  id: string().optional(),
  url: string().url({ message: "The URL format is incorrect." }),
  title: string().min(1),
  description: string().optional(),
  icon: string().optional(),
  tags: array(string()).min(1, { message: "Please select at least one tag." }),
});

export type WebpageFormData = z.infer<typeof webpageFormData>

export type WebpageWithTags = PrismaWebpage & {
  tags: TagWithChildrenAndParentAndLevel[]
}

export type CreateWebpage = Prisma.WebPageCreateInput & {
  tags: string[]
}

// export type WebpageWithTags = Prisma.WebPageGetPayload<{
//   include: {
//     tags: {

//     }
//   }
// }>