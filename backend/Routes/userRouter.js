import express from "express";
import {
  Login,
  // UpdateAddress,
  signup,
  fetchAllUsers,
  profilepicUpdate,
  googleAuth,
  checkAuth,
  logout,
  Update,
  verifyOTP
} from "../Controllers/userController.js";
import { validateToken } from "../Middlewares/validateToken.js";
import upload from "../Middlewares/multer.js";

const router = express.Router();

router.post("/login", Login); //Checked

router.post("/signup", signup); //Checked

router.post("/verify-otp", verifyOTP); 

router.post("/googleAuth", googleAuth); // NOT Checked

router.post("/logout", logout);  //Checked

router.get("/checkAuth", validateToken, checkAuth);   //Checked

// Admin crud
router.get("/fetchall", validateToken, fetchAllUsers); //Checked

// user - address | pass | name
router.put("/update", validateToken, Update); //Checked

router.put(  //Checked
  "/profilepicUpdate",
  upload.single("profilepic"),
  validateToken,
  profilepicUpdate
);

export default router;
