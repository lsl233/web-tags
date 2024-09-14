import { object, string, array } from "zod";
import { Tag as PrismaTag, Prisma } from "server/node_modules/@prisma/client";

export const collectWebSchema = object({
  url: string().url({ message: "网址格式错误" }),
  title: string().min(1, { message: "标题至少1个字符" }),
  description: string().min(1, { message: "描述至少1个字符" }),
  icon: string().optional(),
  tags: array(string()).min(1, { message: "至少选择一个标签" }),
});


export type WebpageWithTags = Prisma.WebPageGetPayload<{
  include: {
    tags: true
  }
}>