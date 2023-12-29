import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import UserError from "./UserErrors.js";

cloudinary.config({
  cloud_name: "ddh9ljlus",
  api_key: "171753396751636",
  api_secret: "3KAjx5zsKbE80jplaasektrEHBo",
});

const cloudinaryUpload = async (localFile) => {
  try {
    if (!localFile) throw new UserError(401, "file path is not mentioned");
    const response = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFile);
    return response;
  } catch (error) {
    fs.unlinkSync(localFile);
    return null;
  }
};
export { cloudinaryUpload };
