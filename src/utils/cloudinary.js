import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import UserError from "./UserErrors.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

const cloudinaryUpload = async (localFile) => {
  try {
    if (!localFile) throw new UserError(401, "file path is not mentioned");
    const response = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFile);
    return response.secure_url;
  } catch (error) {
    fs.unlinkSync(localFile);
    console.log(error.message);
  }
};
export { cloudinaryUpload };
