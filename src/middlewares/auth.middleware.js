import UserError from "../utils/UserErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new UserError(401, "Unauthorized User");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select(
      "-refreshToken -password"
    );
    req.user = user;
    next();
  } catch (error) {
    throw new UserError(400, `${error.message}`);
  }
});

export { verifyJWT };
