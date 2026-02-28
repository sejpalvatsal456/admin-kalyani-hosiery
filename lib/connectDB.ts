import mongoose from "mongoose";

export const connectDB = async() => {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  const MONGODB_NAME = process.env.MONGODB_NAME as string;

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_NAME, bufferCommands: false })
    .then(() => {
        console.log("DB is connected successfully");
    })
    .catch(err => {
        throw Error("Error in DB connection: " + err);
    })

}