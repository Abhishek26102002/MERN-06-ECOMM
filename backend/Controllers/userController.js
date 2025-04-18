import asyncHandler from "express-async-handler";
import Users from "../Models/userModel.js"; // Ensure correct file extension
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../Config/cloudinary.js";
import oauth2Client from "../utils/googleClient.utils.js";
import { generateToken } from "../utils/token.utils.js";


export const fetchAllUsers = asyncHandler(async (req, res) => {
    if (req.user.is_Admin !== true) {
      return res.status(403).json({
        success: false,
        message: "User not Authorized",
      });
    }
  
    try {
      // Retrieve all users from the database
      const users = await Users.find().sort({ createdAt: -1 });
  
      // Check if users are found
      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }
  
      // Respond with all users
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.log("Error in getuser Controller :", error.message);
      res.status(500).json({ success: false, message: "Internal Server error" });
    }
  });
  
