import app from './app.js';
import env from './config/env.js';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 HackSprint Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${env.nodeEnv}`);
  console.log(`=================================`);
});
