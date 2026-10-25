import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
const host = process.env.HOST || '0.0.0.0';

try {
  await connectDatabase();
  app.listen(port, host, () => {
    console.info(`Hospital Management API listening on http://${host}:${port}`);
  });
} catch (error) {
  console.error('Failed to start the API server:', error);
  process.exitCode = 1;
}