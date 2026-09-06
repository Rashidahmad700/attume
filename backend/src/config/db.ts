import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
    });
    console.log(`[db] connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[db] connection failed', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log('[db] connection closed');
}
