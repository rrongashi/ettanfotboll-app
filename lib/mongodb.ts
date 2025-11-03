import mongoose, { Mongoose } from 'mongoose';

type MongooseCache = {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCachedConnection: MongooseCache | undefined;
}

let cached = global._mongooseCachedConnection;

if (!cached) {
  cached = global._mongooseCachedConnection = { connection: null, promise: null };
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached!.connection) {
    return cached!.connection;
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('Missing MONGODB_URI environment variable. Set it in .env.local');
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(mongodbUri, {
      dbName: process.env.MONGODB_DB || undefined
    });
  }

  cached!.connection = await cached!.promise;
  return cached!.connection;
}


