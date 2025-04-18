import asyncHandler from "express-async-handler";
import Products from "../Models/productModel.js"
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cloudinary from "../Config/cloudinary.js";

export const fetchproduct = asyncHandler(async (req, res) => {
    try {
      // Retrieve all post from the database
      const prod = await Products.find().sort({ createdAt: -1 });

      // Check if users are found
      if (!prod || prod.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No product found found",
        });
      }
  
      // Respond with all users
      res.status(200).json({
        success: true,
        data: prod,
      });
    } catch (error) {
      console.log("Error in getPost ProductController :", error.message);
      res.status(500).json({ success: false, message: "Internal Server error" });
    }
    //get all product
  });
  