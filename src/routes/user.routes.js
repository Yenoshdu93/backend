import express from "express";
import {
  registerUser,
  logIn,
  logOutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(logIn);

//secure routes
router.route("/logout").post(verifyJWT, logOutUser);

export default router;
