import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },

    // Wishlist of products
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],

    // Cart
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
        quantity: { type: Number, default: 1 },
      },
    ],

    // Detailed Address
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },

    // Orders Reference
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "orders" }],

    // Profile 
    profilepic: { type: String, default: "" },

    // Last Login ?? idk how to use this filed will do that later
    lastLogin: { type: Date },
    is_Admin: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
