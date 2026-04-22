import mongoose from 'mongoose';

const buildMongoUri = () => {
  // Prefer explicit full URI, fallback to parts for safer credential encoding.
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const cluster = process.env.MONGO_CLUSTER;
  const dbName = process.env.MONGO_DB_NAME || 'smart_agriculture_db';

  if (!username || !password || !cluster) {
    return '';
  }

  return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}/${dbName}?retryWrites=true&w=majority`;
};

const connectDB = async () => {
  try {
    const mongoUri = buildMongoUri();

    if (!mongoUri) {
      console.error('MongoDB connection failed: MONGO_URI or Mongo parts are missing.');
      return false;
    }

    // Keep MongoDB connection logic centralized for easier maintenance.
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
};

export default connectDB;
