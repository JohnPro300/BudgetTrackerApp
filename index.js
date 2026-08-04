import 'dotenv/config';
import app from './app.js';
import connectDB from './Src/Config/db.js';

const PORT = process.env.PORT || 5000;

// Boot sequence:
const startServer = async () => {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Start the HTTP server
  const server = app.listen(PORT, () => {
    console.log(`Budget Tracker API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // localhost trigger shutdown:
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
