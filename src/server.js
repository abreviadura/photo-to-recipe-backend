import path from 'path';

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

import authRoutes from './routes/auth.js';
import usersRouter from "./routes/users.js";
import recipesRouter from './routes/recipes.js';

export async function setupServer() {
  const PORT = Number(getEnvVar('PORT', '3000'));
  const app = express();

  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      maxAge: '7d',
    }),
  );

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://photo-to-recipe-frontend-topaz.vercel.app',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    pino({
      transport: { target: 'pino-pretty' },
    }),
  );

  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use("/api/users", usersRouter);
  app.use('/api/recipes', recipesRouter);

  app.get('/', (req, res) => {
    res.json({ status: 'OK' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
