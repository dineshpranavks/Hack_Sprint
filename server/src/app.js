import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import routes from './routes/index.js';
import agentRoutes from './routes/agent.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();

// Global Middlewares
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health & API Router Mounting
app.use('/api/v1', routes);
app.use('/api/agent', agentRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;
