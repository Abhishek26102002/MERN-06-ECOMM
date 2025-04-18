import express from "express";
import {
  Login,
  Update,
 
  Signup,
  fetchAllUsers,
  profilepicUpdate,
  googleAuth,
  checkAuth,
  logout,
} from "../Controllers/userController.js";
import { validateToken } from "../Middlewares/validateToken.js";
import upload from "../Middlewares/multer.js";

const router = express.Router();

router.post("/login", Login); // admin can only login no registration

router.post("/signup", Signup);

router.post("/googleAuth", googleAuth);

router.post("/logout", logout);

// user/Admin crud (Far Future)
router.get("/fetchall", validateToken, fetchAllUsers); //Only Admin

router.get("/checkAuth", validateToken, checkAuth); // user himself

// user address | pass   
// router.put("/update", validateToken, Update);


router.put(
  "/profilepicUpdate",
  upload.single("profilepic"),
  validateToken,
  profilepicUpdate
);


export default router;
