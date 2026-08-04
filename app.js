import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Middleware:
import errorHandler from './Src/Middleware/errorHandler.js';
import { apiLimiter } from './Src/Middleware/rateLimiter.js';

// Routers:
import authRouter from './Src/Routers/authRouter.js';
import userRouter from './Src/Routers/userRouter.js';
import transactionRouter from './Src/Routers/transactionRouter.js';
import categoryRouter from './Src/Routers/categoryRouter.js';
import budgetRouter from './Src/Routers/budgetRouter.js';
import reportRouter from './Src/Routers/reportRouter.js';

const app = express();

// Security & Parsing Middleware:
app.use(helmet()); // sets secure HTTP headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (only in development):
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Budget Tracker API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes 
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/reports', reportRouter);

// 404 Handler:
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler (must be last):
app.use(errorHandler);

export default app;
