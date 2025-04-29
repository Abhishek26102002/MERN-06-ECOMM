import jwt from "jsonwebtoken";
import Users from "../Models/userModel.js";

export const validateToken = async (req, res, next) => {
  try {
    // Access the JWT from the cookies
    const token = req.cookies.jwt;

    if (!token) {
      console.log("No Token Provided");
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized User" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log("User has false secret key");
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized User" });
    }

    // Find the user by ID
    const user = await Users.findById(decoded.userId).select("-password");
  
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach user to the request object
    next(); // very imp => now run the next function/line of code
  } catch (error) {
    console.log("Error in ValidateToken Middleware :", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
