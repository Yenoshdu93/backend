import dotenv from "dotenv";
import { connectDb } from "./Database/index.js";
import { app } from "./app.js";

dotenv.config();

connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Port is running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Connecting problem ,${err.message}`);
  });
