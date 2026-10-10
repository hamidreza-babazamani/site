import mongoose from "mongoose";
import { requiredEnv } from "./env-core";

const globalForMongoose = globalThis as typeof globalThis & {
  mongoosePromise?: Promise<typeof mongoose>;
};

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  const pending = globalForMongoose.mongoosePromise ?? mongoose.connect(requiredEnv("MONGODB_URI"), { serverSelectionTimeoutMS: 10000 });
  globalForMongoose.mongoosePromise = pending;
  try {
    await pending;
    return mongoose;
  } finally {
    if (globalForMongoose.mongoosePromise === pending) globalForMongoose.mongoosePromise = undefined;
  }
};

export const disconnectDatabase = () => mongoose.disconnect();
