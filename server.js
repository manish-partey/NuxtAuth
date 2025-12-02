// Azure Web App startup script
import { execSync } from 'child_process';

// Set the port that Azure provides or default to 3000
process.env.PORT = process.env.PORT || '3000';

// Start the Nuxt server
try {
  console.log('Starting Nuxt.js server on port', process.env.PORT);
  execSync('node .output/server/index.mjs', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      HOST: '0.0.0.0',
      PORT: process.env.PORT 
    }
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}