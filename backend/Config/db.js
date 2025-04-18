import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb Connected, ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Conn ERROR ${error}`);
  }
};
