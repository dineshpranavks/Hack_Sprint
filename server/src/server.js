import app from './app.js';
import env from './config/env.js';

const PORT = env.port;

const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 HackSprint Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${env.nodeEnv}`);
  console.log(`=================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`=================================`);
    console.log(`⚠️ Port ${PORT} is already in use. The backend server is already running!`);
    console.log(`=================================`);
  } else {
    console.error('[Server Startup Error]:', err);
  }
});
