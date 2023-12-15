import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongo is connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("Db is not connected", error.message);
    process.exit(1);
  }
};

export { connectDb };
