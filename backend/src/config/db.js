import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  try {
    let uri = env.MONGO_URI;
    // Ensure database name is set if missing in Atlas URI
    if (uri.includes('mongodb.net') && !uri.includes('mongodb.net/')) {
      uri = `${uri}/office_resource_db?retryWrites=true&w=majority`;
    } else if (uri.endsWith('.mongodb.net/')) {
      uri = `${uri}office_resource_db?retryWrites=true&w=majority`;
    }

    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
