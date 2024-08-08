import mongoose from 'mongoose';

export const MongoConnection = async () => {
  const mongoURL = process.env.MONGO_URL ?? '';
  mongoose
    .connect(mongoURL, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    })
    .then(() => {
      console.log(`Connected to MongoDB instance=======> ${mongoURL}`);
    })
    .catch((err: any) => {
      console.log(err?.message);
      return err;
    });
};
