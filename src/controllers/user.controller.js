import asyncHandler from "../utils/asyncHandler.js";
import UserError from "../utils/UserErrors.js";
import RequestResponse from "../utils/Responseapi.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
import User from "../model/user.model.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(`Error occured during create ar tokens ${error.message}`);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (
    [username, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new UserError(400, "Please fill in all required fields");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new UserError(400, "Username or email is already in use");
  }

  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverPath = req.files?.cover?.[0]?.path;

  if (!avatarPath) {
    throw new UserError(400, "Avatar file is required");
  }

  let cover = "";
  if (coverPath) {
    cover = await cloudinaryUpload(coverPath);

    if (!cover) {
      throw new UserError(500, "Failed to upload cover image");
    }
  }

  const avatar = await cloudinaryUpload(avatarPath);

  if (!avatar) throw new UserError(400, "Avatar is required");

  const user = await User.create({
    username,
    email,
    avatar: avatar.url,
    cover: cover.url || "",
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new UserError(500, "Failed to register the user");
  }

  return res
    .status(201)
    .json(
      new RequestResponse(200, createdUser, "User registered successfully")
    );
});

const logIn = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) throw new UserError(400, "Enter email or username");

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) throw new UserError(401, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new UserError(400, "Enter Valid password");

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const logedUser = await User.findOne(user._id).select(
    "-refreshToken -password"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new RequestResponse(200, {
        user: { accessToken, refreshToken, logedUser },
      })
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: false,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new RequestResponse(200, {}, "loged out successfully"));
});

export { registerUser, logIn, logOutUser };
