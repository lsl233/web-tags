import { UserPayload } from "shared/user";

// global.d.ts
declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
