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
  verifyOTP,
  userdelete,
  createOrder,
  addToCart,
  addToWishlist,
  fetchOrder,
} from "../Controllers/userController.js";
import { validateToken } from "../Middlewares/validateToken.js";
import upload from "../Middlewares/multer.js";

const router = express.Router();

router.post("/login", Login);

router.post("/signup", signup);

router.post("/verify-otp", verifyOTP);

router.post("/googleAuth", googleAuth); // NOT Checked

router.post("/logout", logout);

router.get("/checkAuth", validateToken, checkAuth);

// Admin crud
router.get("/fetchall", validateToken, fetchAllUsers);

// user - address | pass | name
router.put("/update", validateToken, Update);

router.put(
  "/profilepicUpdate",
  upload.single("profilepic"),
  validateToken,
  profilepicUpdate
);

router.post("/deleteaccount", validateToken, userdelete);

// Store Operation
router.post("/addtocart", validateToken, addToCart);

router.post("/addtowishlist", validateToken, addToWishlist);

router.post("/createorder", validateToken, createOrder);

router.get("/fetchorder/:id", validateToken, fetchOrder);

// cancel order
// refund (Admin)
// status change (Admin)
// 

export default router;
