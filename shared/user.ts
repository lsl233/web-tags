import type { UserType as PrismaUserType } from "server/node_modules/@prisma/client";

export enum UserType {
  NORMAL = "NORMAL",
  GUEST = "GUEST"
}
export interface UserPayload {
  id: string;
  type: PrismaUserType;
  email: string;
}