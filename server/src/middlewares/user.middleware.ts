import ServerError from "@/lib/error.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "shared/user.js";


interface AuthenticatedRequest extends Request {
  user?: UserPayload; // 定义扩展的 `Request` 类型，包含 `user` 信息
}

// 这个密钥在生产环境下应该存储在环境变量中


// 用户信息处理的中间件
export const userMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!process.env.JWT_SECRET) {
   return next(ServerError.Unauthorized("JWT_SECRET is not set"))
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || (req.path === '/api/user/session' && req.method === 'POST')) {
    return next()
  }

  if (!authHeader.startsWith("Bearer ")) {
    return next(ServerError.Unauthorized("Invalid token"))
  }

  const token = authHeader.split(" ")[1]; // 提取 token

  try {
    // 验证 token 并提取用户信息
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as unknown as UserPayload;

    
    // 将用户信息附加到请求对象上，供后续路由使用
    req.user = decoded;
    next(); // 继续到下一个中间件或路由
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ServerError.Unauthorized(err.message));
    }
    return next(ServerError.Unauthorized("Invalid token"));
  }
};
