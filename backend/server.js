const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Movie E-Ticket Management System',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve frontend static files if built (VS Code & Production preview support)
const frontendDist = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback for all non-API GET requests (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.resolve(frontendDist, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) next();
    });
  }
  next();
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const showAndSeatService = require('./services/ShowAndSeatService');

// Periodic seat hold cleanup (every 30 seconds, unref so it does not block clean process exit or testing)
const cleanupTimer = setInterval(() => {
  try {
    showAndSeatService.cleanupExpiredHolds();
  } catch (err) {
    console.error('Error during expired holds cleanup:', err);
  }
}, 30000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

// Start server (only start listener if invoked directly from CLI)
let server = null;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎬 Movie E-Ticket Backend running on http://localhost:${PORT}`);
    console.log(`📡 API Endpoints active at http://localhost:${PORT}/api`);
    console.log(`🌐 Website accessible at http://localhost:${PORT}`);
    console.log(`🎫 Host UPI QR Payment & Ticket Services Ready`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };
