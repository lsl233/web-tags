

import { db } from "../src/lib/db";

async function getTagsWithSortOrder() {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: 'asc' },
    });
  
    const tagsWithoutSortOrder = tags.filter(tag => tag.sortOrder === null);
    if (tagsWithoutSortOrder.length > 0) {
      await prisma.$transaction(
        tagsWithoutSortOrder.map((tag, index) =>
          prisma.tag.update({
            where: { id: tag.id },
            data: { sortOrder: index + 1 },
          })
        )
      );
    }
  
    return tags.map((tag, index) => ({
      ...tag,
      sortOrder: tag.sortOrder ?? index + 1,
    }));
  }
