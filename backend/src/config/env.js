import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/office_resource_db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};

export default env;
export const { PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL } = env;
