import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)), quiet: true });
const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
const app = createApp({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || undefined });
// Local development only; deployment needs authentication and request rate limits.
app.listen(port, '127.0.0.1', () => console.log(`StudyMate API running at http://127.0.0.1:${port}`));
