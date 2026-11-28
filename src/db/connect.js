import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

let database;
let client;

const connectToDb = async (options = {}) => {
  if (database) {
    return database;
  }

  const connectionString = options.connectionString || process.env.MONGODB_URI;
  const databaseName = options.databaseName || process.env.MONGODB_DB_NAME || 'practice';

  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }

  client = new MongoClient(connectionString);

  try {
    await client.connect();
    database = client.db(databaseName);

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connectionString, { dbName: databaseName });
    }

    return database;
  } catch (error) {
    await client.close();
    client = undefined;
    database = undefined;
    throw error;
  }
};

const getDb = () => {
  if (!database) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }

  return database;
};

const closeDb = async () => {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export { closeDb, connectToDb, getDb };