import 'express-async-errors'
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { userMiddleware } from './middlewares/user.middleware.js';
import userRoutes from './routes/user.route.js';
import webpageRoutes from './routes/webpage.route.js';
import tagRoutes from './routes/tag.route.js';
import spiderRoutes from './routes/spider.route.js';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env);

const init = async () => {
  const app = express();
  app.set('trust proxy', true);
  // TODO set cors properly
  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));
  app.use(express.json());
  
  app.use(userMiddleware);
  app.use('/api/user', userRoutes);
  app.use('/api/webpage', webpageRoutes);
  app.use('/api/tag', tagRoutes);
  app.use('/api/spider', spiderRoutes);
  
  app.use(errorMiddleware);
  // /auth/signin/github
  // 1. /api/auth/signin
  //    provider github
  // 2. /api/auth/signup
  // 3. /api/auth/signout，callbackUrl
  // app.use('/auth/*', ExpressAuth(authConfig));

  
  // TODO get port from env
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`);
  });
};

init();
