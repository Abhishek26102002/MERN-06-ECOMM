import asyncHandler from "express-async-handler";
import Users from "../Models/userModel.js"; // Ensure correct file extension
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../Config/cloudinary.js";
import oauth2Client from "../utils/googleClient.utils.js";
import { generateToken } from "../utils/token.utils.js";
// import crypto from "crypto";
import nodemailer from "nodemailer";
import Orders from "../Models/orderModel.js"; // adjust path as needed
import Products from "../Models/productModel.js"; // assuming you're using a separate model
import Cart from "../Models/cartModel.js";
import WishList from "../Models/wishListModel.js";

export const fetchAllUsers = asyncHandler(async (req, res) => {
  //At strict mode if we dont define some fields in schema so even when it is present in data mongoose denies that
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

export const signup = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    // Validate name
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid name: Must be at least 2 characters and contain only letters and spaces",
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email: Must be a valid email address",
      });
    }

    // Validate password
    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid password: Must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Check if user already exists
    const userAvailable = await Users.findOne({ email });
    if (userAvailable) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash the password
    const hashPass = await bcrypt.hash(password, 10);

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await Users.create({
      name,
      email,
      password: hashPass,
      otp,
      otpExpiry,
    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "OTP Verification",
      html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete signup.",
    });
  } catch (error) {
    console.log("Error in userRegister Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid email" });
  }

  if (user.verified) {
    return res
      .status(400)
      .json({ success: false, message: "User already verified" });
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  user.verified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Generate token after verification
  generateToken(user._id, res);

  res.status(200).json({
    success: true,
    message: "User verified successfully",
    data: user,
  });
});

export const Login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatory",
      });
    }

    const user = await Users.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate access token and save in cookie for better handling as localstorage dont support state mantain
      generateToken(user._id, res);

      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Login failed: Invalid email or password",
      });
    }
  } catch (error) {
    console.log("Error in userLogin Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});

export const googleAuth = async (req, res) => {
  const { code } = req.body; // Receive Google ID Token from frontend as url

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Google token is required",
    });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Match with frontend client ID
    });

    const { email, name, picture, at_hash } = ticket.getPayload();

    let user = await Users.findOne({ email });

    if (!user) {
      user = await Users.create({
        name: name,
        email,
        profilepic: picture,
        password: at_hash,
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      success: true,
      message: "Google authentication successful!",
      data: user,
    });
  } catch (error) {
    console.error("Error in GoogleAuth Controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const Update = asyncHandler(async (req, res) => {
  try {
    const { email, name, password, address } = req.body;

    // Validate input fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to update user details",
      });
    }

    if (!name && !password && !address) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (name or password or address) must be provided for update",
      });
    }

    // Check if the user exists
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify permissions: Only allow if the logged-in user is the same user
    // req.user.email is comming from validate token where req.user = decoded.user
    if (req.user.email !== email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to update this user",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (address) user.address = address;
    if (password) {
      const hashPass = await bcrypt.hash(password, 10);
      user.password = hashPass;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.log("Error in userUpdate Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});

export const profilepicUpdate = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    // Upload file to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    // Update user profile with new image URL
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { profilepic: uploadResponse.secure_url },
      { new: true, runValidators: true }
    ).select("-password ");

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in profilepicUpdate Controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const userdelete = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    // Validate input fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to update user details",
      });
    }
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.user.email !== email && !req.user.is_Admin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to delete this user",
      });
    }

    await Users.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.log("Error in userDelete Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Authenticated",
      data: req.user,
    });
  } catch (error) {
    console.log("Error in checkAuth Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logged out Successfully" });
  } catch (error) {
    console.log("Error in Logout Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

// TODO : add payment method properly
// reduce the stock of the product
//
export const createOrder = async (req, res) => {
  try {
    const {
      products, // array: [{ productID, quantity }]
      shippingAddress,
      billingAddress,
      paymentMethod,
      transactionId,
    } = req.body;

    const userId = req.user.id;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products provided" });
    }

    let totalAmount = 0;
    const detailedProducts = [];

    for (const item of products) {
      const { productID, quantity, colors } = item;
      const product = await Products.findById(productID);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productID}`,
        });
      }

      // Find the selected color variant
      const selectedColor = product.colors.find(
        (clr) => clr.name === colors.name && clr.hex === colors.hex
      );

      if (!selectedColor) {
        return res.status(400).json({
          success: false,
          message: `Color ${colors.name} not found for product ${product.name}`,
        });
      }

      // Find the selected size variant
      const selectedSize = selectedColor.sizes.find(
        (sz) => sz.size === colors.sizes.size
      );

      if (!selectedSize) {
        return res.status(400).json({
          success: false,
          message: `Size ${colors.sizes.size} not available in color ${colors.name}`,
        });
      }

      // Calculate price based on quantity and unit price
      const totalPrice = selectedSize.price * quantity;
      totalAmount += totalPrice;

      // Append detailed product info
      detailedProducts.push({
        productID,
        name: product.name,
        description: product.description,
        colour: {
          name: selectedColor.name,
          hex: selectedColor.hex,
          image: selectedColor.image,
          sizes: {
            size: selectedSize.size,
            price: selectedSize.price,
            stock: selectedSize.stock,
            sku: selectedSize.sku,
          },
        },
        quantity,
        totalPrice,
      });
    }

    const orderID = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const deliveryTimeline = {
      orderDate: new Date(),
      shippingDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      outForDeliveryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      deliveredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const newOrder = await Orders.create({
      orderID,
      orderBy: userId,
      products: detailedProducts,
      totalAmount,
      status: "ordered",
      deliveryTimeline,
      shippingAddress,
      billingAddress,
      paymentMethod,
      transactionId,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid", // you can adjust this
    });

    //push orderID to user
    await Users.findByIdAndUpdate(
      userId,
      { $push: { orders: newOrder._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.log("Error in CreateOrder Controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};
export const addToCart = asyncHandler(async (req, res) => {
  try {
    const { products } = req.body; // array: [{ productID, quantity }]

    const userId = req.user.id;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products provided" });
    }

    let totalAmount = 0;
    const detailedProducts = [];

    for (const item of products) {
      const { productID, quantity, colors } = item;
      const product = await Products.findById(productID);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productID}`,
        });
      }

      // Find the selected color variant
      const selectedColor = product.colors.find(
        (clr) => clr.name === colors.name && clr.hex === colors.hex
      );

      if (!selectedColor) {
        return res.status(400).json({
          success: false,
          message: `Color ${colors.name} not found for product ${product.name}`,
        });
      }

      // Find the selected size variant
      const selectedSize = selectedColor.sizes.find(
        (sz) => sz.size === colors.sizes.size
      );

      if (!selectedSize) {
        return res.status(400).json({
          success: false,
          message: `Size ${colors.sizes.size} not available in color ${colors.name}`,
        });
      }

      // Calculate price based on quantity and unit price
      const totalPrice = selectedSize.price * quantity;
      totalAmount += totalPrice;

      // Append detailed product info
      detailedProducts.push({
        productID,
        name: product.name,
        description: product.description,
        colour: {
          name: selectedColor.name,
          hex: selectedColor.hex,
          image: selectedColor.image,
          sizes: {
            size: selectedSize.size,
            price: selectedSize.price,
            stock: selectedSize.stock,
            sku: selectedSize.sku,
          },
        },
        quantity,
      });
    }

    const newOrder = await Cart.create({
      addedBy: userId,
      products: detailedProducts,
      totalAmount,
    });

    //push orderID to user
    await Users.findByIdAndUpdate(
      userId,
      { $push: { cart: newOrder._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Added to cart",
      data: newOrder,
    });
  } catch (error) {
    console.log("Error in addToCart Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});
export const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { products } = req.body; // array: [{ productID, quantity }]

    const userId = req.user.id;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products provided" });
    }

    let totalAmount = 0;
    const detailedProducts = [];

    for (const item of products) {
      const { productID, quantity, colors } = item;
      const product = await Products.findById(productID);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productID}`,
        });
      }

      // Find the selected color variant
      const selectedColor = product.colors.find(
        (clr) => clr.name === colors.name && clr.hex === colors.hex
      );

      if (!selectedColor) {
        return res.status(400).json({
          success: false,
          message: `Color ${colors.name} not found for product ${product.name}`,
        });
      }

      // Find the selected size variant
      const selectedSize = selectedColor.sizes.find(
        (sz) => sz.size === colors.sizes.size
      );

      if (!selectedSize) {
        return res.status(400).json({
          success: false,
          message: `Size ${colors.sizes.size} not available in color ${colors.name}`,
        });
      }

      // Calculate price based on quantity and unit price
      const totalPrice = selectedSize.price * quantity;
      totalAmount += totalPrice;

      // Append detailed product info
      detailedProducts.push({
        productID,
        name: product.name,
        description: product.description,
        colour: {
          name: selectedColor.name,
          hex: selectedColor.hex,
          image: selectedColor.image,
          sizes: {
            size: selectedSize.size,
            price: selectedSize.price,
            stock: selectedSize.stock,
            sku: selectedSize.sku,
          },
        },
        quantity,
      });
    }

    const newOrder = await WishList.create({
      addedBy: userId,
      products: detailedProducts,
      totalAmount,
    });

    //push orderID to user
    await Users.findByIdAndUpdate(
      userId,
      { $push: { wishlist: newOrder._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      data: newOrder,
    });
  } catch (error) {
    console.log("Error in addToWishList Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});
export const fetchOrder = asyncHandler(async (req, res) => {
  try {
    const userID = req.params.id;

    if (userID != req.user.id) {
      return res.status(401).json({
        success: false,
        message: "unauthorized",
      });
    }

    const orders = await Orders.find({ orderBy: userID });

    res.status(200).json({
      success: true,
      message: "Fetched Successfully",
      data: orders,
    });
  } catch (error) {
    console.log("Error in CreateOrder Controller :", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
});
