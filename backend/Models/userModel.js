import mongoose from "mongoose";

const userScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store the hashed password
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Orders" }],
    phone:{type: String, required: true},
    verified:{type:boolean,default:false}, // toggle once verified by otp
    address: { type: String, default: "" },
    profilepic: {
      type: String,
      default: "",
    }, // Reference to Blog collection
  },
  { timestamps: true }
);

export default mongoose.model("users", userScheme);
// Users is Collection name in database
