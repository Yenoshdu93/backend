import asyncHandler from "../utils/asyncHandler.js";
import UserError from "../utils/UserErrors.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
import User from "../model/user.model.js";
import RequestResponse from "../utils/Response.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new UserError(401, "Don't let the fields empty");
  }
  const existingUser = await User.findOne({ $or: [{ username, email }] });
  if (existingUser) {
    throw new UserError(401, "user is already exists");
  }
  //file upload

  const avatarLocalPath = req.files?.avatar[0]?.path;

  //  let coverImageLocalPath;
  //  if (
  //    req.files &&
  //    Array.isArray(req.files.coverImage) &&
  //    req.files.coverImage.length > 0
  //  ) {
  //    coverImageLocalPath = req.files.coverImage[0].path;
  //  }

  if (!avatarLocalPath) throw new UserError(400, "File is required");

  const avatar = await cloudinaryUpload(avatarLocalPath);

  const user = await User.create({
    username,
    email,
    avatar: avatar,
    password,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new UserError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new RequestResponse(200, createdUser, "User registered Successfully")
    );
});

export { registerUser };
