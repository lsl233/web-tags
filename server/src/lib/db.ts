import { PrismaClient, Prisma } from "@prisma/client";

// 定义全局变量类型
declare global {
  var prisma: PrismaClient;
}

let prisma: PrismaClient;

if (!globalThis.prisma) {
  // 创建 PrismaClient 实例
  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ["query", "info", "warn", "error"],
  });

  // 连接事件监听
  prisma
    .$connect()
    .then(() => {
      console.log("PrismaClient has connected");
    })
    .catch((error: Error) => {
      console.error("Failed to connect:", error);
    });

  // 导出扩展后的 Prisma 客户端

  // 在开发环境中，避免重复创建实例，防止内存泄露
  globalThis.prisma = prisma;
}

export const db = globalThis.prisma;
