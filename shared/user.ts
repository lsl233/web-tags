import { $Enums } from "server/node_modules/@prisma/client";

export const UserType = $Enums.UserType
export interface UserPayload {
  id: string;
  type: $Enums.UserType;
  email: string;
}