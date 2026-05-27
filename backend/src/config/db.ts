import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Successfully bound connection to MongoDB Cluster.');
  } catch (error) {
    console.error('MongoDB database connection engine failure:', error);
    process.exit(1);
  }
};